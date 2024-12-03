package com.castify.backend.service.userActivity;

import com.castify.backend.enums.ActivityType;
import com.castify.backend.models.PageDTO;
import com.castify.backend.models.userActivity.AddActivityRequestDTO;
import com.castify.backend.models.userActivity.UserActivityModel;

public interface IUserActivityService {
    void addActivity(AddActivityRequestDTO requestDTO) throws Exception;
    PageDTO<UserActivityModel> getViewPodcastActivitiesByDate(int page) throws Exception;
    void removeViewPodcastActivity(String actId);
    void removeAllViewPodcastActivities() throws Exception;
}
