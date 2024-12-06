package com.castify.backend.controller;

import com.castify.backend.service.dashboard.DashboardServiceImpl;
import com.castify.backend.service.dashboard.IDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/creator/statistics")
public class CreatorDashboardController {
    @Autowired
    private IDashboardService dashboardService = new DashboardServiceImpl();

    @GetMapping("")
    private ResponseEntity<?> getUserDashboard() throws Exception {
        try{
            return ResponseEntity.ok(dashboardService.getCreatorDashboard());
        }catch (Exception ex){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error"+ex.getMessage());
        }
//        return ResponseEntity.ok(dashboardService.getCreatorDashboard());
    }
}
