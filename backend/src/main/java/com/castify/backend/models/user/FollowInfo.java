package com.castify.backend.models.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FollowInfo {
    private String userId;
    private LocalDateTime timeStamp = LocalDateTime.now();
}
