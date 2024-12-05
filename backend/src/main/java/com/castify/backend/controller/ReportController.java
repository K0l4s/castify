package com.castify.backend.controller;

import com.castify.backend.models.report.ReportRequest;
import com.castify.backend.service.report.IReportService;
import com.castify.backend.service.report.ReportServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/report")
public class ReportController {
    @Autowired
    private IReportService reportService = new ReportServiceImpl();

    @PostMapping("")
    private ResponseEntity<?> sendRequest(
            @RequestBody ReportRequest reportRequest
            ) throws Exception{
        try{
            return ResponseEntity.ok(
                    reportService.sendReport(reportRequest)
            );
        }catch (Exception ex){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error"+ex.getMessage());
        }
    }
}
