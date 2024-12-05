package com.castify.backend.models.report;

import com.castify.backend.enums.ReportStatus;
import com.castify.backend.enums.ReportType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportRequest{
    private String title;
    private String detail;
    @Enumerated(EnumType.STRING)
    private ReportType type;
    private String target;
//    private String userReportId;
}
