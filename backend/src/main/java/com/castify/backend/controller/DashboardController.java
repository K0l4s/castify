package com.castify.backend.controller;

import com.castify.backend.repository.template.DashboardRepositoryTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    @Autowired
    private DashboardRepositoryTemplate dashboardRepository;

    /**
     * API trả về tổng số liệu thống kê cho Dashboard
     */
    @GetMapping("/statistics")
    public Map<String, Object> getStatistics() {
        LocalDateTime startDate = LocalDateTime.of(2024, 11, 1, 0, 0, 0, 0);
        LocalDateTime endDate = LocalDateTime.of(2024, 11, 30, 23, 59, 59, 999999);
        return dashboardRepository.getDashboardStatistics(startDate, endDate);
    }
}
