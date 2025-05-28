package com.castify.backend.repository;

import com.castify.backend.entity.PodcastLikeEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PodcastLikeRepository  extends MongoRepository<PodcastLikeEntity, String> {
    boolean existsByUserEntityIdAndPodcastEntityId(String userId, String podcastId);
    Optional<PodcastLikeEntity> findByUserEntityIdAndPodcastEntityId(String userId, String podcastId);
//    List<PodcastLikeEntity> findByPodcastId(String podcastId);
    long countByPodcastEntityId(String podcastId);
    Page<PodcastLikeEntity> findByUserEntityIdOrderByTimestampDesc(String userId, Pageable pageable);
}
