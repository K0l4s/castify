package com.castify.backend.controller;

import com.castify.backend.models.dashboard.OverviewModel;
import com.castify.backend.service.dashboard.DashboardServiceImpl;
import com.castify.backend.service.dashboard.IDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;

@RestController
@RequestMapping("/api/v1/admin/statistics")
public class AdminDashboardController {

    @Autowired
//    private DashboardTemplate dashboardRepository;
    private IDashboardService dashboardService = new DashboardServiceImpl();

    @GetMapping("")
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
    @GetMapping("/graph")
    private ResponseEntity<?> getGraphData(
            @RequestParam(value = "startDate", required = false) LocalDateTime startDate,
            @RequestParam(value = "endDate", required = false) LocalDateTime endDate
    ) throws Exception {
        try{
            return ResponseEntity.ok(dashboardService.getAdminStaticsGraphDataByDate(startDate,endDate));
        }catch (Exception ex){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error"+ex.getMessage());
        }
//        return ResponseEntity.ok(dashboardService.getCreatorDashboard());
    }
}
