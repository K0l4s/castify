package com.castify.backend.repository;

import com.castify.backend.entity.VideoTrackingEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Service;

@Service
public interface VideoTrackingRepository extends MongoRepository<VideoTrackingEntity,String> {
    VideoTrackingEntity findVideoTrackingEntityByPodcastIdAndUserId(String podcastId, String userId);
}
