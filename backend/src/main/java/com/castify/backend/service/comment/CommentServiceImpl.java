package com.castify.backend.service.comment;

import com.castify.backend.entity.CommentEntity;
import com.castify.backend.entity.PodcastEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.models.comment.CommentModel;
import com.castify.backend.models.comment.CommentRequestDTO;
import com.castify.backend.repository.CommentRepository;
import com.castify.backend.repository.PodcastRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentServiceImpl implements ICommentService {
    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PodcastRepository podcastRepository;

    @Autowired
    private ModelMapper modelMapper;

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
    public List<CommentModel> getPodcastComments(String id) {
        try {
            List<CommentEntity> commentEntities = commentRepository.findByPodcastId(id);

            return commentEntities.stream()
                    .map(commentEntity -> modelMapper.map(commentEntity, CommentModel.class))
                    .toList();
        } catch (Exception e) {
            System.out.println("Error getting comments: " + e.getMessage());
            throw new RuntimeException("Failed to get comments", e);
        }
    }
}
