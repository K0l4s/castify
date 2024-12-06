package com.castify.backend.service.comment;

import com.castify.backend.entity.*;
import com.castify.backend.models.PageDTO;
import com.castify.backend.models.comment.CommentModel;
import com.castify.backend.models.comment.CommentRequestDTO;
import com.castify.backend.repository.*;
import com.castify.backend.service.user.IUserService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CommentServiceImpl implements ICommentService {
    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PodcastRepository podcastRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private IUserService userService;

    @Autowired
    private CommentLikeRepository commentLikeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserActivityRepository userActivityRepository;

    @Override
    public CommentModel addComment(CommentRequestDTO commentRequestDTO) {
        try {
            UserEntity userEntity = userService.getUserByAuthentication();
            PodcastEntity podcastEntity = podcastRepository.findById(commentRequestDTO.getPodcastId())
                    .orElseThrow(() -> new RuntimeException("Podcast not found"));

            CommentEntity commentEntity = modelMapper.map(commentRequestDTO, CommentEntity.class);
            commentEntity.setId(null);
            commentEntity.setPodcast(podcastEntity);
            commentEntity.setParentId(commentRequestDTO.getParentId());
            commentEntity.setUser(userEntity);
            commentEntity.setContent(commentEntity.getContent());
            commentEntity.setTimestamp(LocalDateTime.now());

            // Nếu có parentId, tìm comment cha và thêm vào replies
            if (commentRequestDTO.getParentId() != null) {
                CommentEntity parentComment = commentRepository.findById(commentRequestDTO.getParentId())
                        .orElseThrow(() -> new RuntimeException("Parent comment not found"));

                // replies là null thì tạo một danh sách rỗng
                if (parentComment.getReplies() == null) {
                    parentComment.setReplies(new ArrayList<>());
                }

                // Lưu comment con trước để MongoDB sinh ID cho commentEntity
                commentRepository.save(commentEntity);

                // Sau khi lưu, commentEntity sẽ có ID hợp lệ
                parentComment.getReplies().add(commentEntity);

                // Mention user nếu có
                if (commentRequestDTO.getMentionedUser() != null) {
                    UserEntity mentionedUser = userRepository.findByUsername(commentRequestDTO.getMentionedUser())
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    commentEntity.setMentionedUser(mentionedUser.getUsername());
                }

                commentRepository.save(parentComment);
            } else {
                // Nếu không có parentId, đây là comment cấp 0
                commentRepository.save(commentEntity);
            }

            // Thêm ref trong PodcastEntity
            if (podcastEntity.getComments() == null) {
                podcastEntity.setComments(new ArrayList<>());
            }

            podcastEntity.getComments().add(commentEntity);

            podcastRepository.save(podcastEntity);

            return modelMapper.map(commentEntity, CommentModel.class);
        } catch (Exception e) {
            System.out.println("Error saving comment: " + e.getMessage());
            throw new RuntimeException("Failed to save comment", e);
        }
    }

    @Override
    public PageDTO<CommentModel> getPodcastComments(String id, int page, int size, String sortBy) {
        try {
            UserEntity userEntity = null;
            try {
                userEntity = userService.getUserByAuthentication();
            } catch (Exception ignored) {
                // Anonymous user
            }

            String sortField = switch (sortBy) {
                case "popular" -> "likeCount"; // Sắp xếp theo số like === BUG
                case "oldest" -> "timestamp"; // Sắp xếp theo thời gian cũ nhất
                default -> "timestamp"; // Mặc định sắp xếp theo thời gian mới nhất
            };

            int sortDirection = sortBy.equals("oldest") ? 1 : -1; // 1 = ASC, -1 = DESC
            int skip = page * size;

            long totalElements = commentRepository.countByPodcastId(id);
            int totalPages = (int) Math.ceil(totalElements / (double) size);

            List<CommentEntity> commentEntities = commentRepository.findCommentsWithLikes(
                    id, sortField, sortDirection, skip, size
            );

            UserEntity finalUserEntity = userEntity;

            List<CommentModel> commentModels = commentEntities.stream()
                    .map(comment -> {
                        CommentModel model = modelMapper.map(comment, CommentModel.class);
                        model.setTotalLikes(comment.getLikes() != null ? comment.getLikes().size() : 0); // Thiết lập `totalLikes`
                        model.setTotalReplies(comment.getTotalReplies());
                        // Neu user entity ton tai thi kiem tra isLiked, nguoc lai set false cho isLiked
                        if (finalUserEntity != null) {
                            boolean isLiked = commentLikeRepository.existsByUserEntityIdAndCommentEntityId(finalUserEntity.getId(), comment.getId());
                            model.setLiked(isLiked);
                        } else {
                            model.setLiked(false);
                        }
                        return model;
                    }).toList();

            return new PageDTO<>(commentModels, size, page, totalPages, totalElements);
        } catch (Exception e) {
            System.out.println("Error getting comments: " + e.getMessage());
            throw new RuntimeException("Failed to get comments", e);
        }
    }

    @Override
    public boolean toggleLikeOnComment(String id) throws Exception {
        UserEntity userEntity = userService.getUserByAuthentication();

        CommentEntity commentEntity = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        Optional<CommentLikeEntity> existingLike = commentLikeRepository
                .findByUserEntityIdAndCommentEntityId(userEntity.getId(), commentEntity.getId());

        if (existingLike.isPresent()) {
            // If like, delete it
            commentLikeRepository.delete(existingLike.get());
            commentEntity.getLikes().remove(existingLike.get());
            commentRepository.save(commentEntity);
            return false;
        } else {
            // If not , add a like
            CommentLikeEntity newLike = new CommentLikeEntity();
            newLike.setCommentEntity(commentEntity);
            newLike.setUserEntity(userEntity);
            newLike.setTimestamp(LocalDateTime.now());
            CommentLikeEntity savedLike = commentLikeRepository.save(newLike);

            if (commentEntity.getLikes() == null) {
                commentEntity.setLikes(new ArrayList<>());
            }

            commentEntity.getLikes().add(savedLike);
            commentRepository.save(commentEntity);
            return true;
        }
    }

    @Override
    public List<CommentModel> getReplies(String id) {
        UserEntity userEntity = null;
        try {
            userEntity = userService.getUserByAuthentication();
        } catch (Exception ignored) {
            // Anonymous user
        }

        Optional<CommentEntity> parentComment = commentRepository.findById(id);
        if (parentComment.isPresent()) {
            UserEntity finalUserEntity = userEntity;
            return parentComment.get().getReplies().stream()
                    .map(reply -> {
                        CommentModel model = modelMapper.map(reply, CommentModel.class);
                        model.setTotalLikes(reply.getLikes() != null ? reply.getLikes().size() : 0);
                        model.setTotalReplies(reply.getTotalReplies());
                        if (finalUserEntity != null) {
                            boolean isLiked = commentLikeRepository.existsByUserEntityIdAndCommentEntityId(finalUserEntity.getId(), reply.getId());
                            model.setLiked(isLiked);
                        } else {
                            model.setLiked(false);
                        }
                        return model;
                    })
                    .toList();
        }
        return null;
    }

    @Override
    public CommentModel getById(String id) {
        Optional<CommentEntity> comment = commentRepository.findById(id);
        if (comment.isPresent()) {
            return modelMapper.map(comment.get(), CommentModel.class);
        } else {
            throw new RuntimeException("Comment not found with id: " + id); // Hoặc xử lý lỗi tùy ý
        }
    }

    @Override
    public void deleteCommentsByIds(List<String> commentIds, boolean isAdmin) throws Exception {
        List<CommentEntity> comments = commentRepository.findAllById(commentIds);

        if (comments.isEmpty() || comments.size() != commentIds.size()) {
            throw new RuntimeException("One or more comments not found.");
        }

        UserEntity currentUser = userService.getUserByAuthentication();

        for (CommentEntity comment : comments) {
            // Kiểm tra quyền
            if (!isAdmin && !comment.getUser().getId().equals(currentUser.getId())) {
                throw new RuntimeException("You do not have permission.");
            }

            // Kiểm tra nếu comment này là cha
            if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
                // Xóa replies chỉ khi comment cha nằm trong danh sách cần xóa
                if (commentIds.contains(comment.getId())) {
                    for (CommentEntity reply : comment.getReplies()) {
                        // Xóa likes của reply
                        if (reply.getLikes() != null && !reply.getLikes().isEmpty()) {
                            commentLikeRepository.deleteAll(reply.getLikes());
                        }
                    }
                    commentRepository.deleteAll(comment.getReplies());
                }
            }

            // Xóa likes của comment
            if (comment.getLikes() != null && !comment.getLikes().isEmpty()) {
                commentLikeRepository.deleteAll(comment.getLikes());
            }

            // Xóa các hoạt động liên quan đến comment
            List<UserActivityEntity> activities = userActivityRepository.findByComment(comment);
            if (activities != null && !activities.isEmpty()) {
                userActivityRepository.deleteAll(activities);
            }

            // Xóa bản thân comment
            commentRepository.delete(comment);
        }
    }

}
