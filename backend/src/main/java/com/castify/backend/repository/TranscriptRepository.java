package com.castify.backend.repository;

import com.castify.backend.entity.TranscriptEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TranscriptRepository extends MongoRepository<TranscriptEntity, String> {
    List<TranscriptEntity> findByPodcastId(String podcastId);
}

