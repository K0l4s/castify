package com.castify.backend.service.dashboard;

import com.castify.backend.models.dashboard.OverviewModel;

import java.time.LocalDateTime;

public interface IDashboardService {
    OverviewModel getOverviewInformation(LocalDateTime start, LocalDateTime end);
}
