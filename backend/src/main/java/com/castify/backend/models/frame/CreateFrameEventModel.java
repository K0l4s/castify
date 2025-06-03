package com.castify.backend.models.frame;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateFrameEventModel {
    @NotNull
    private String name;
    @NotNull
    private String description;
//    private List<String> bannersUrl;
    @NotNull
    private LocalDateTime startDate;
    @NotNull
    private LocalDateTime endDate;
    private Double percent; //Phân tram giam cua mat hang, null neu su kien khong giam gia!
    private boolean active =true; //Co the de-active su kien trong luc start - end
}
