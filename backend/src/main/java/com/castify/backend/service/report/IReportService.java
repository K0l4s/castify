package com.castify.backend.service.report;


import com.castify.backend.enums.ReportStatus;
import com.castify.backend.enums.ReportType;
import com.castify.backend.models.paginated.PaginatedResponse;
import com.castify.backend.models.report.ProgressReport;
import com.castify.backend.models.report.ReportRequest;
import com.castify.backend.models.report.ReportResponse;

public interface IReportService {
    String sendReport(ReportRequest request) throws Exception;

    String progressReport(String reportId, ProgressReport reportProgress) throws Exception;

    PaginatedResponse<ReportResponse> getAllReport(Integer pageNumber, Integer pageSize, ReportStatus status, ReportType type, String keyword);
}
