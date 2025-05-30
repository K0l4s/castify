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
    List<WatchPartyRoomEntity> findByIsPublicTrueAndIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);
    List<WatchPartyRoomEntity> findByHostUserId(String hostUserId);
}
