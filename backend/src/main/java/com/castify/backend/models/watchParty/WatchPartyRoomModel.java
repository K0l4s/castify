package com.castify.backend.models.watchParty;

import com.castify.backend.entity.watchParty.WatchPartyParticipant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WatchPartyRoomModel {
    private String id;
    private String roomCode;
    private String roomName;
    private String hostUserId;
    private String hostUsername;
    private String podcastId;
    private String podcastThumbnail;

    private List<WatchPartyParticipant> participants;
    private int maxParticipants;

    // Playback state
    private long currentPosition; // Current playback position in seconds
    private boolean isPlaying;
    private LocalDateTime lastUpdated;

    // Room settings
    private boolean publish;
    private boolean allowChat;
    private boolean hostOnlyControl;

    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private List<String> bannedUserIds;
    private boolean isActive;
}
