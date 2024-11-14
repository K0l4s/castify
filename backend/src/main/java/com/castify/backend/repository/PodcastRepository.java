package com.castify.backend.repository;

import com.castify.backend.entity.PodcastEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PodcastRepository extends MongoRepository<PodcastEntity, String> {

}
