package com.castify.backend.models.conversation;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShortConversationModel {
    private String id;
    private String title;
    private String imageUrl;
    private int memberSize;
    private String lastMessage; // Nội dung tin nhắn mới nhất
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime lastMessageTimestamp; // Thời gian tin nhắn mới nhất
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime createdAt = LocalDateTime.now();
}

