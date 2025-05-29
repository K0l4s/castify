package com.castify.backend.repository;

import com.castify.backend.entity.PodcastEntity;
import com.castify.backend.entity.UserEntity;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PodcastRepository extends MongoRepository<PodcastEntity, String> {
    Optional<List<PodcastEntity>> findAllByUserId(String userId);
    Optional<PodcastEntity> findByIdAndIsActiveTrue(String id);
    Page<PodcastEntity> findAllByIsActiveTrue(Pageable pageable);
    @Query("{ 'user.id': ?0, 'views': { $gte: ?1 } }")
    Page<PodcastEntity> findByFilters(String userId, int minViews, Pageable pageable);

    long countByUser(UserEntity user);

    Page<PodcastEntity> findByIsActiveTrue(Pageable pageable);

    Page<PodcastEntity> findByGenres_IdAndIsActiveTrue(String genreId, Pageable pageable);

    @Query("{ 'user.id': ?0, 'isActive': true }")
    Page<PodcastEntity> findAllByUserIdAndIsActiveTrue(String userId, Pageable pageable);

    @Query("{'isActive': true, '$or': [" +
            "{'title': { '$regex': ?0, $options: 'i' }}," +   // Search in title
            "{'content': { '$regex': ?0, $options: 'i' }},"+
            "]}")
    Page<PodcastEntity> searchPodcastByFields(String keyword, Pageable pageable);
    List<PodcastEntity> findByUserIdAndCreatedDayBetween(String userId, LocalDateTime start, LocalDateTime end);
    List<PodcastEntity> findByUserId(String userId);
    @Query("{ 'user.$id': { $in: ?0 }, 'isActive': true }")
    Page<PodcastEntity> findByUserIdInAndIsActiveTrue(List<ObjectId> userIds, Pageable pageable);
    @Query(value = "{ 'genres': { $exists: true } }", fields = "{ 'genres': 1 }")
    List<PodcastEntity> findAllGenresInPodcasts();
    @Query(value = "{ '_id': { '$ne': ?0 }, 'isActive': true, '$or': [ { 'user.$id': ?1 }, { 'genres._id': { '$in': ?2 } } ] }")
    List<PodcastEntity> findSuggestedPodcasts(String currentPodcastId, String userId, List<String> genreIds, Sort sort);
    PodcastEntity findPodcastEntityById(String id);
}
