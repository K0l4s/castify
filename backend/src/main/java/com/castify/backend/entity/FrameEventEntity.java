package com.castify.backend.entity;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "frameEvent")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class FrameEventEntity {
    @Id
    private String id;

    private String name;
    private LocalDateTime createDate;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
//    private
}
