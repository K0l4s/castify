package com.castify.backend.entity.watchParty;

import com.castify.backend.enums.SyncEventType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PlaybackSyncEvent {
    private String roomId;
    private String userId; // Who triggered the event
    private long position; // Current position in seconds
    private boolean isPlaying;
    private LocalDateTime timestamp = LocalDateTime.now();
    private SyncEventType eventType;
}