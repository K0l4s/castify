package com.castify.backend.repository;

import com.castify.backend.entity.UserFrameEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserFrameRepository extends MongoRepository<UserFrameEntity, String> {

}
