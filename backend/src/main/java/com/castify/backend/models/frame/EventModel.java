package com.castify.backend.models.frame;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class EventModel {
    private String id;

    private String name;
    private String description;
    private List<String> bannersUrl;
    private LocalDateTime createDate = LocalDateTime.now();
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Double percent; //Phân tram giam cua mat hang, null neu su kien khong giam gia!
    private boolean active; //Co the de-active su kien trong luc start - end

//    public boolean getShowEvent()
}
