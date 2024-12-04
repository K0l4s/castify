package com.castify.backend.repository;

import com.castify.backend.entity.PodcastEntity;
import com.castify.backend.entity.UserActivityEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.enums.ActivityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserActivityRepository extends MongoRepository<UserActivityEntity, String> {
    List<UserActivityEntity> findAllByUserIdAndType(String userId, ActivityType type, Sort sort);
    UserActivityEntity findByUserAndTypeAndPodcast(UserEntity user, ActivityType type, PodcastEntity podcast);
    UserActivityEntity findByIdAndType(String id, ActivityType type);
    List<UserActivityEntity> findAllByUserIdAndType(String userId, ActivityType type);
    @Query("{ 'user.$id': ?0, 'podcast.title': { $regex: ?1, $options: 'i' } }")
    List<UserActivityEntity> findAllByUserIdAndPodcastTitle(String userId, String podcastTitle);
}
