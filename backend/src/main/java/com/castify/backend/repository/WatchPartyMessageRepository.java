package com.castify.backend.repository;

import com.castify.backend.entity.watchParty.WatchPartyMessageEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WatchPartyMessageRepository extends MongoRepository<WatchPartyMessageEntity, String> {
    List<WatchPartyMessageEntity> findByRoomIdOrderByTimestampDesc(String roomId, Pageable pageable);
    void deleteByRoomId(String roomId);
}
