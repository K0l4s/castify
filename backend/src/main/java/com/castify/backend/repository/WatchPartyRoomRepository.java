package com.castify.backend.repository;

import com.castify.backend.entity.watchParty.WatchPartyRoomEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchPartyRoomRepository extends MongoRepository<WatchPartyRoomEntity, String> {
    Optional<WatchPartyRoomEntity> findByRoomCodeAndIsActiveTrue(String roomCode);
    Optional<WatchPartyRoomEntity> findByIdAndIsActiveTrue(String id);
    boolean existsByRoomCodeAndIsActiveTrue(String roomCode);
    List<WatchPartyRoomEntity> findByPublishTrueAndIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);
    long countByPublishTrueAndIsActiveTrue();
    List<WatchPartyRoomEntity> findByHostUserId(String hostUserId);

    List<WatchPartyRoomEntity> findByHostUserIdAndIsActiveTrueOrderByCreatedAtDesc(String hostUserId, Pageable pageable);
    long countByHostUserIdAndIsActiveTrue(String hostUserId);
    List<WatchPartyRoomEntity> findByPublishTrueAndIsActiveTrueAndHostUserIdNotOrderByCreatedAtDesc(String excludeHostUserId, Pageable pageable);
    long countByPublishTrueAndIsActiveTrueAndHostUserIdNot(String excludeHostUserId);
}
