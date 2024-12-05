package com.castify.backend.models.report;

import com.castify.backend.enums.ReportStatus;
import com.castify.backend.enums.ReportType;
import com.castify.backend.models.user.ShortUser;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private String id;
    private String title;
    private String detail;
    private ReportType type;
    private LocalDateTime createdDay;
    private ReportStatus status;
    private String target;
    private ShortUser userRequest;
    private ShortUser userResponse;
    private List<String> handleMethod = new ArrayList<>();
}
