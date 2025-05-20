package com.castify.backend.repository;

import com.castify.backend.entity.PlaylistEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PlaylistRepository extends MongoRepository<PlaylistEntity, String> {
    Optional<PlaylistEntity> findByIdAndPublishTrue(String id);
}
