package com.castify.backend.repository;

import com.castify.backend.entity.VisitorEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface VisitorRepository extends MongoRepository<VisitorEntity, String> {
}
