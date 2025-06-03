package com.castify.backend.entity;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "frameEvent")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class FrameEventEntity {
    @Id
    private String id;

    private String name;
    private String description;
    private List<String> bannersUrl;
    private LocalDateTime createDate = LocalDateTime.now();
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Double percent; //Phân tram giam cua mat hang, null neu su kien khong giam gia!
    private boolean active; //Co the de-active su kien trong luc start - end

    public boolean getShowEvent()
    {
        if(!active)
            return false; //Uu tien active hon
        LocalDateTime now = LocalDateTime.now();
        //Su kien dang dien ra thi return true, khong thi false
        return startDate.isBefore(now) || endDate.isAfter(now);
    }

}
