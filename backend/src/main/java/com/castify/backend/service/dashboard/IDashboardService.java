package com.castify.backend.service.dashboard;

import com.castify.backend.models.dashboard.OverviewModel;

import java.time.LocalDateTime;
import java.util.Map;

public interface IDashboardService {
    OverviewModel getOverviewInformation(LocalDateTime start, LocalDateTime end);

    Map<String, Object> getCreatorDashboard() throws Exception;

    Map<String, Object> getCreatorDashboard(LocalDateTime start, LocalDateTime end) throws Exception;

    Map<String, Object> getPodcastStaticsGraphDataByDate(LocalDateTime start, LocalDateTime end) throws Exception;
}
