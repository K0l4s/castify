package com.castify.backend.service.comment;

import com.castify.backend.entity.CommentEntity;
import com.castify.backend.entity.CommentLikeEntity;
import com.castify.backend.entity.PodcastEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.models.PageDTO;
import com.castify.backend.models.comment.CommentModel;
import com.castify.backend.models.comment.CommentRequestDTO;
import com.castify.backend.repository.CommentLikeRepository;
import com.castify.backend.repository.CommentRepository;
import com.castify.backend.repository.PodcastRepository;
import com.castify.backend.service.user.IUserService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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

    @Override
    public CommentModel addComment(UserEntity user, CommentRequestDTO commentRequestDTO) {
        try {
            PodcastEntity podcastEntity = podcastRepository.findById(commentRequestDTO.getPodcastId())
                    .orElseThrow(() -> new RuntimeException("Podcast not found"));

            CommentEntity commentEntity = modelMapper.map(commentRequestDTO, CommentEntity.class);
            commentEntity.setId(null);
            commentEntity.setPodcast(podcastEntity);
            commentEntity.setUser(user);
            commentEntity.setContent(commentEntity.getContent());
            commentEntity.setTimestamp(LocalDateTime.now());

            commentRepository.save(commentEntity);

            return modelMapper.map(commentEntity, CommentModel.class);
        } catch (Exception e) {
            System.out.println("Error saving comment: " + e.getMessage());
            throw new RuntimeException("Failed to save comment", e);
        }
    }

    @Override
    public PageDTO<CommentModel> getPodcastComments(String id, int page, int size, String sortBy) {
        try {
            String sortField = switch (sortBy) {
                case "popular" -> "likeCount"; // Sắp xếp theo số like
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

            List<CommentModel> commentModels = commentEntities.stream()
                    .map(comment -> {
                        CommentModel model = modelMapper.map(comment, CommentModel.class);
                        model.setTotalLikes(comment.getLikes() != null ? comment.getLikes().size() : 0); // Thiết lập `totalLikes`
                        return model;
                    }).toList();

            return new PageDTO<>(commentModels, size, page, totalPages, totalElements);
        } catch (Exception e) {
            System.out.println("Error getting comments: " + e.getMessage());
            throw new RuntimeException("Failed to get comments", e);
        }
    }

    @Override
    public String toggleLikeOnComment(String id) throws Exception {
        UserEntity userEntity = userService.getUserByAuthentication();

        CommentEntity commentEntity = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        Optional<CommentLikeEntity> existingLike = commentLikeRepository
                .findByUserEntityIdAndCommentEntityId(userEntity.getId(), commentEntity.getId());

        if (existingLike.isPresent()) {
            // If like, delete it
            commentLikeRepository.delete(existingLike.get());
        } else {
            // If not , add a like
            CommentLikeEntity newLike = new CommentLikeEntity();
            newLike.setCommentEntity(commentEntity);
            newLike.setUserEntity(userEntity);
            newLike.setTimestamp(LocalDateTime.now());
            commentLikeRepository.save(newLike);
        }
        return "Success";
    }
}
