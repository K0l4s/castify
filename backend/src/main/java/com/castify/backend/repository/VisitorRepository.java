package com.castify.backend.repository;

import com.castify.backend.entity.VisitorEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VisitorRepository extends MongoRepository<VisitorEntity, String> {
}
