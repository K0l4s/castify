package com.castify.backend.repository;

import com.castify.backend.entity.UserFrameEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface UserFrameRepository extends MongoRepository<UserFrameEntity, String> {
    @Query("{ 'user.id': ?0 }")
    List<UserFrameEntity> findByUserId(String userId);
    UserFrameEntity findUserByUserId(String userId);
//    @Query(value = "{ 'user.$id': ?0, 'frames': ?1 }", exists = true)
    boolean existsByUserIdAndFramesContains(String userId, String frameId);

    @Query("{ 'frames.id': ?0 }")
    List<UserFrameEntity> findByFrameId(String frameId);

    @Query(value = "{ 'user.id': ?0, 'frames.id': ?1 }", delete = true)
    void deleteByUserIdAndFrameId(String userId, String frameId);

//    long countByFramesContains(String frameId);
     long  countByFramesInAndPurchasedAtBetween(List<String> frames, LocalDateTime before, LocalDateTime after);
}
