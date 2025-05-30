package com.castify.backend.entity;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "videoTracking")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VideoTrackingEntity {
    @Id
    private String id;
    private String podcastId;
    private Double pauseTime;
    private String userId;
}
