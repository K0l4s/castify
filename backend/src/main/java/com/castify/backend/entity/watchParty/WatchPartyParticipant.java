package com.castify.backend.entity.watchParty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WatchPartyParticipant {
    private String userId;
    private String username;
    private String avatarUrl;
    private LocalDateTime joinedAt = LocalDateTime.now();
    private boolean isOnline = true;
    private LocalDateTime lastSeen = LocalDateTime.now();
}
