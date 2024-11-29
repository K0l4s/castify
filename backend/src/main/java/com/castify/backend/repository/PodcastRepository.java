package com.castify.backend.repository;

import com.castify.backend.entity.PodcastEntity;
import com.castify.backend.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PodcastRepository extends MongoRepository<PodcastEntity, String> {
    Optional<List<PodcastEntity>> findAllByUserId(String userId);

    @Query("{ 'user.id': ?0, 'views': { $gte: ?1 } }")
    Page<PodcastEntity> findByFilters(String userId, int minViews, Pageable pageable);
    long countByUser(UserEntity user);
    Page<PodcastEntity> findByIsActiveTrue(Pageable pageable);
    Page<PodcastEntity> findByGenres_IdAndIsActiveTrue(String genreId, Pageable pageable);
}
