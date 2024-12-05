package com.castify.backend.models.report;

import com.castify.backend.enums.ReportProgressType;
import com.castify.backend.enums.ReportStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProgressReport {
    @Enumerated(EnumType.STRING)
    private ReportStatus status;
    private List<ReportProgress> progressList = new ArrayList<>();
}
