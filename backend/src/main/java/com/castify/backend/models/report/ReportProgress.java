package com.castify.backend.models.report;

import com.castify.backend.enums.ReportProgressType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportProgress {
    @Enumerated(EnumType.STRING)
    private ReportProgressType type;
    private String targetId;
}
