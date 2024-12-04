package com.castify.backend.service.userActivity;

import com.castify.backend.enums.ActivityType;
import com.castify.backend.models.PageDTO;
import com.castify.backend.models.userActivity.AddActivityRequestDTO;
import com.castify.backend.models.userActivity.UserActivityGroupedByDate;
import com.castify.backend.models.userActivity.UserActivityModel;

import java.util.List;

public interface IUserActivityService {
    void addActivity(AddActivityRequestDTO requestDTO) throws Exception;
    PageDTO<UserActivityModel> getViewPodcastActivitiesByDate(int page) throws Exception;
    void removeViewPodcastActivity(String actId);
    void removeAllViewPodcastActivities() throws Exception;
    List<UserActivityGroupedByDate> searchActivitiesByPodcastTitleAndGroupByDate(String title) throws Exception;
}
