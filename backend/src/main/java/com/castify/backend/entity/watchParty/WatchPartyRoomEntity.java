package com.castify.backend.entity.watchParty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "watchPartyRoom")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class WatchPartyRoomEntity {
    @Id
    private String id;

    private String roomCode; // 6-digit unique code for joining
    private String roomName;
    private String hostUserId;
    private String podcastId;
    private String podcastThumbnail;

    private List<WatchPartyParticipant> participants = new ArrayList<>();
    private int maxParticipants = 100;

    // Playback state
    private long currentPosition = 0; // Current playback position in seconds
    private boolean isPlaying = false;
    private LocalDateTime lastUpdated = LocalDateTime.now();

    // Room settings
    private boolean publish = true; // Public rooms can be discovered
    private boolean allowChat = true;
    private boolean hostOnlyControl = true; // Only host can control playback

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime expiresAt; // Auto-expire after X hours
    private List<String> bannedUserIds = new ArrayList<>();
    private boolean isActive = true;

    public boolean isFull() {
        return participants.size() >= maxParticipants;
    }

    public boolean isHost(String userId) {
        return hostUserId.equals(userId);
    }

    public boolean hasParticipant(String userId) {
        return participants.stream()
                .anyMatch(p -> p.getUserId().equals(userId));
    }

    public boolean isBanned(String userId) {
        return bannedUserIds.contains(userId);
    }

    public void banUser(String userId) {
        if (!bannedUserIds.contains(userId)) {
            bannedUserIds.add(userId);
        }
    }

    public void unbanUser(String userId) {
        bannedUserIds.remove(userId);
    }
}
