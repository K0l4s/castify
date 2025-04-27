package com.castify.backend.repository;

import com.castify.backend.entity.BlacklistEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlacklistRepository extends MongoRepository<BlacklistEntity,String> {
}
