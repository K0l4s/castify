package com.castify.backend.repository;

import com.castify.backend.entity.CommentEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository  extends MongoRepository<CommentEntity, String> {
    List<CommentEntity> findByPodcastId(String podcastId);
    long countByPodcastId(String podcastId);
}
