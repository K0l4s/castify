package com.castify.backend.models.notification;

import com.castify.backend.enums.NotiType;
import com.castify.backend.models.user.ShortUser;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotifiModel {
    private String id;
    private String title;
    private String content;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime createdAt;
    private String targetUrl;
    private NotiType type;
    private ShortUser sender;
    private String receiverId;

    private boolean read;
}
