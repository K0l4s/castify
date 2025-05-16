package com.castify.backend.repository;

import com.castify.backend.entity.PlaylistEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PlaylistRepository extends MongoRepository<PlaylistEntity, String> {
}
