package com.castify.backend.entity.watchParty;

import com.castify.backend.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Document(collection = "watchPartyMessage")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class WatchPartyMessageEntity {
    @Id
    private String id;

    private String roomId;
    private String userId;
    private String username;
    private String avatarUrl;
    private String message;
    private MessageType type = MessageType.CHAT;
    private LocalDateTime timestamp = LocalDateTime.now();

    // For system messages (user joined, left, etc.)
    private Map<String, Object> metadata = new HashMap<>();
}