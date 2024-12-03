package com.castify.backend.controller;

import com.castify.backend.models.dashboard.OverviewModel;
import com.castify.backend.repository.template.DashboardTemplate;
import com.castify.backend.service.dashboard.DashboardServiceImpl;
import com.castify.backend.service.dashboard.IDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    @Autowired
//    private DashboardTemplate dashboardRepository;
    private IDashboardService dashboardService = new DashboardServiceImpl();
    /**
     * API trả về tổng số liệu thống kê cho Dashboard
     */
    @GetMapping("/statistics")
    public OverviewModel getStatistics(
            @RequestParam(value = "startDate", required = false) LocalDateTime startDate,
            @RequestParam(value = "endDate", required = false) LocalDateTime endDate
    ) {
        if (startDate == null) {
            startDate = LocalDateTime.now().withDayOfMonth(1).with(LocalTime.MIN);
        }

        if (endDate == null) {
            endDate = LocalDateTime.now().with(TemporalAdjusters.lastDayOfMonth()).with(LocalTime.MAX);
        }

        return dashboardService.getOverviewInformation(startDate,endDate);
    }

}
