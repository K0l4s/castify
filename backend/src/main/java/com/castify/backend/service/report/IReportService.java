package com.castify.backend.service.report;


import com.castify.backend.models.report.ReportRequest;

public interface IReportService {
    String sendReport(ReportRequest request) throws Exception;
}
