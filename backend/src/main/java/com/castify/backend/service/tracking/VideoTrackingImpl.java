package com.castify.backend.service.tracking;

import com.castify.backend.entity.UserEntity;
import com.castify.backend.entity.VideoTrackingEntity;
import com.castify.backend.repository.VideoTrackingRepository;
import com.castify.backend.service.user.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class VideoTrackingImpl implements IVideoTracking{
    @Autowired
    private VideoTrackingRepository videoTrackingRepository;
    @Autowired
    private IUserService userService;
    @Override
    public void updateTracking(String userId, String podcastId, Double pauseTime) {
        VideoTrackingEntity tracking = videoTrackingRepository
                .findVideoTrackingEntityByPodcastIdAndUserId(podcastId, userId);

        if (tracking == null) {
            tracking = new VideoTrackingEntity();
            tracking.setPodcastId(podcastId);
            tracking.setUserId(userId);
        }

        tracking.setPauseTime(pauseTime);
        videoTrackingRepository.save(tracking);
    }
    @Override
    public VideoTrackingEntity getVideoTrackingByPodcastAndUser(String podcastId) throws Exception {
        UserEntity currentUser = userService.getUserByAuthentication();
        return videoTrackingRepository.findVideoTrackingEntityByPodcastIdAndUserId(podcastId,currentUser.getId());
    }
}
