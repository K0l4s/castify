package com.castify.backend.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TrackingRequest {
    private String podcastId;
    private String userId;
    private Double pauseTime;
}
