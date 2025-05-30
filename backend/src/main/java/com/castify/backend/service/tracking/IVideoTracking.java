package com.castify.backend.service.tracking;

import com.castify.backend.entity.VideoTrackingEntity;

public interface IVideoTracking {
    void updateTracking(String userId, String podcastId, Double pauseTime);

    VideoTrackingEntity getVideoTrackingByPodcastAndUser(String podcastId) throws Exception;
}
