package com.castify.backend.service.comment;

import com.castify.backend.entity.*;
import com.castify.backend.enums.NotiType;
import com.castify.backend.exception.PermissionDeniedException;
import com.castify.backend.models.PageDTO;
import com.castify.backend.models.comment.CommentModel;
import com.castify.backend.models.comment.CommentRequestDTO;
import com.castify.backend.repository.*;
import com.castify.backend.service.blacklist.IBlacklistService;
import com.castify.backend.service.notification.INotificationService;
import com.castify.backend.service.notification.NotificationServiceImpl;
import com.castify.backend.service.user.IUserService;
import com.castify.backend.utils.SecurityUtils;
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

    @Autowired
    private INotificationService notificationService;
    @Autowired
    private IBlacklistService blacklistService;
    @Override
    public CommentModel addComment(CommentRequestDTO commentRequestDTO) {
        try {
            UserEntity currentUser = userService.getUserByAuthentication();

            // Kiểm tra podcast
            PodcastEntity podcast = podcastRepository.findById(commentRequestDTO.getPodcastId())
                    .orElseThrow(() -> new RuntimeException("Podcast not found"));

            // Tạo comment entity
            CommentEntity comment = new CommentEntity();
            comment.setId(null);
            comment.setUser(currentUser);
            comment.setPodcast(podcast);
            comment.setParentId(commentRequestDTO.getParentId());
            comment.setTimestamp(LocalDateTime.now());

            // Gán content (xử lý censor nếu có vi phạm)
            String originalContent = commentRequestDTO.getContent();
            if (blacklistService.calculateViolationScore(originalContent) >= 1) {
                notificationService.saveNotificationNonSender(
                        currentUser.getId(),
                        NotiType.WARNING,
                        "CẢNH BÁO VI PHẠM!",
                        "Comment của bạn có chứa từ khóa cấm, hãy cẩn thận lần sau!",
                        ""
                );
                originalContent = blacklistService.censorViolationWords(originalContent);
            }

            // Xử lý mention user (nếu có)
            if (commentRequestDTO.getMentionedUser() != null) {
                comment.setContent("@" + commentRequestDTO.getMentionedUser() + " " + originalContent);

                UserEntity mentionedUser = userRepository.findByUsername(commentRequestDTO.getMentionedUser())
                        .orElseThrow(() -> new RuntimeException("Mentioned user not found"));
                comment.setMentionedUser(mentionedUser.getUsername());
            } else {
                comment.setContent(originalContent);
            }

            // Lưu comment
            CommentEntity savedComment;
            if (comment.getParentId() != null) {
                CommentEntity parent = commentRepository.findById(comment.getParentId())
                        .orElseThrow(() -> new RuntimeException("Parent comment not found"));

                if (parent.getReplies() == null) {
                    parent.setReplies(new ArrayList<>());
                }

                savedComment = commentRepository.save(comment);
                parent.getReplies().add(savedComment);
                commentRepository.save(parent);
            } else {
                savedComment = commentRepository.save(comment);
            }

            // Thêm comment vào podcast
            if (podcast.getComments() == null) {
                podcast.setComments(new ArrayList<>());
            }
            podcast.getComments().add(savedComment);
            podcastRepository.save(podcast);

            // Gửi thông báo đến chủ podcast nếu có
            if (podcast.getUser() != null) {
                String notiContent = currentUser.getFullname() + " đã bình luận: " + originalContent + " trên video " + podcast.getTitle();
                notificationService.saveNotification(
                        podcast.getUser().getId(),
                        NotiType.COMMENT,
                        "Bạn có bình luận mới!",
                        notiContent,
                        "/watch?pid=" + podcast.getId()
                );
            }

            return modelMapper.map(savedComment, CommentModel.class);
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

            // Nếu comment là con, xóa tham chiếu trong cha
            if (comment.getParentId() != null) {
                CommentEntity parentComment = commentRepository.findById(comment.getParentId())
                        .orElseThrow(() -> new RuntimeException("Parent comment not found."));
                parentComment.getReplies().removeIf(reply -> reply.getId().equals(comment.getId()));
                commentRepository.save(parentComment);
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

    @Override
    public CommentModel editComment(String id, String content) {
        UserEntity auth = SecurityUtils.getCurrentUser();
        CommentEntity comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + id));
        if (!comment.getUser().getId().equals(auth.getId())) {
            throw new PermissionDeniedException("You do not have permission.");
        }

        if (content != null && !content.isEmpty()) {
            comment.setContent(content);
            comment.setLastModified(LocalDateTime.now());
        }

        commentRepository.save(comment);
        return modelMapper.map(comment, CommentModel.class);
    }

}
