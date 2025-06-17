package com.castify.backend.repository;

import com.castify.backend.entity.PlaylistEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.enums.PlaylistType;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PlaylistRepository extends MongoRepository<PlaylistEntity, String> {
    Optional<PlaylistEntity> findByIdAndPublishTrue(String id);
    Optional<PlaylistEntity> findByOwnerAndType(UserEntity owner, PlaylistType type);
}
