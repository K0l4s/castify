package com.castify.backend.models.conversation;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LastReadMessage {
    private String lastMessageId;
    private LocalDateTime lastReadTime;
}
