package com.castify.backend.repository;

import com.castify.backend.entity.PodcastLikeEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PodcastLikeRepository  extends MongoRepository<PodcastLikeEntity, String> {
    boolean existsByUserEntityIdAndPodcastId(String userId, String podcastId);
    List<PodcastLikeEntity> findByPodcastId(String podcastId);
    long countByPodcastId(String podcastId);
}
