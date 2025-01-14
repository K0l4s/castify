package com.castify.backend.entity;

import com.castify.backend.enums.NotiType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document("notification")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class NotificationEntity {
    @Id
    private String id;

    private String title;
    private String content;
    private LocalDateTime createdAt = LocalDateTime.now();
    private String targetUrl; //Bỏ domain, ví dụ: http//localhost:5000/profile/kolas thì chỉ lưu /profile/kolas
    @Enumerated(EnumType.STRING)
    private NotiType type;
    @DBRef
    private UserEntity sender;
//    private boolean isHideSender = false;
//    @DBRef
    private String receiverId;

    private boolean read = false;

}
