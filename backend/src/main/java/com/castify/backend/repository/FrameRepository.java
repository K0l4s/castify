package com.castify.backend.repository;

import com.castify.backend.entity.FrameEntity;
import com.castify.backend.enums.FrameStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface FrameRepository extends MongoRepository<FrameEntity, String> {
    List<FrameEntity> findAllByStatus(FrameStatus status);
}
