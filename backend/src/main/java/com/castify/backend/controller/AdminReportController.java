package com.castify.backend.controller;

import com.castify.backend.enums.ReportStatus;
import com.castify.backend.enums.ReportType;
import com.castify.backend.models.report.ProgressReport;
import com.castify.backend.models.report.ReportProgress;
import com.castify.backend.service.report.IReportService;
import com.castify.backend.service.report.ReportServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/v1/admin/report")
@RestController
public class AdminReportController {
    @Autowired
    private IReportService reportService = new ReportServiceImpl();

    @PutMapping("")
    private ResponseEntity<?> progressReport(
            @RequestParam("reportId") String reportId,
            @RequestBody ProgressReport progress
    ) throws Exception {
//        return null;
        try {
            return ResponseEntity.ok(
                    reportService.progressReport(reportId, progress)
            );
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error " + ex.getMessage());
        }
    }
    @GetMapping("")
    private ResponseEntity<?> getAllReport(
            @RequestParam(value = "pageNumber") Integer pageNumber,
            @RequestParam(value = "pageSize") Integer pageSize,
            @RequestParam(value="status",required = false)ReportStatus status,
            @RequestParam(value="type",required = false)ReportType type,
            @RequestParam(value="keyword",required=false)String keyword
            ) throws Exception {
//        return null;
        try {
                return ResponseEntity.ok(
                            reportService.getAllReport(pageNumber,pageSize,status,type,keyword)
                );
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error " + ex.getMessage());
        }
    }
}
