package com.castify.backend.service.watchParty;

import com.castify.backend.entity.watchParty.WatchPartyRoomEntity;
import com.castify.backend.repository.WatchPartyMessageRepository;
import com.castify.backend.repository.WatchPartyRoomRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WatchPartyCleanupServiceImpl implements IWatchPartyCleanupService{
    private final WatchPartyRoomRepository roomRepository;
    private final WatchPartyMessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Scheduled(fixedRate = 300000) // Run every 5 minutes (300,000ms)
    @Transactional
    @Override
    public void expireRooms() {
        LocalDateTime now = LocalDateTime.now();

        // Find all active rooms that have expired
        List<WatchPartyRoomEntity> expiredRooms = roomRepository.findByIsActiveTrueAndExpiresAtBefore(now);
        log.info("Cleaning up expired rooms {}", expiredRooms);

        if (!expiredRooms.isEmpty()) {
            log.info("Found {} expired rooms to clean up", expiredRooms.size());

            for (WatchPartyRoomEntity room : expiredRooms) {
                try {
                    expireRoom(room);
                    log.info("Successfully expired room: {} (Code: {})", room.getRoomName(), room.getRoomCode());
                } catch (Exception e) {
                    log.error("Failed to expire room: {} - {}", room.getRoomCode(), e.getMessage());
                }
            }
        }
    }

    /**
     * Clean up old inactive rooms every hour
     * Remove rooms that have been inactive for more than 24 hours
     */
    @Scheduled(fixedRate = 3600000) // Run every hour (3,600,000ms)
    @Transactional
    @Override
    public void cleanupOldRooms() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(48);

        // Find rooms that are inactive and older than 48 hours
        List<WatchPartyRoomEntity> oldRooms = roomRepository.findByIsActiveFalseAndLastUpdatedBefore(cutoff);

        if (!oldRooms.isEmpty()) {
            log.info("Cleaning up {} old inactive rooms", oldRooms.size());

            for (WatchPartyRoomEntity room : oldRooms) {
                try {
                    // Delete messages first
                    messageRepository.deleteByRoomId(room.getId());

                    // Delete room
                    roomRepository.delete(room);

                    log.info("Deleted old room: {} (Code: {})", room.getRoomName(), room.getRoomCode());
                } catch (Exception e) {
                    log.error("Failed to delete old room: {} - {}", room.getRoomCode(), e.getMessage());
                }
            }
        }
    }

    /**
     * Expire a single room
     */
    private void expireRoom(WatchPartyRoomEntity room) {
        String roomId = room.getId();

        // Notify all participants before closing
        notifyRoomExpiration(room);

        // Mark room as inactive
        room.setActive(false);
        room.setLastUpdated(LocalDateTime.now());

        // Save room state
        roomRepository.save(room);

        // Send final closure notification
        sendRoomClosedNotification(room, "AUTO_EXPIRED");

        log.info("Room expired: {} (Code: {}) - Created: {}, Expired: {}",
                room.getRoomName(), room.getRoomCode(), room.getCreatedAt(), room.getExpiresAt());
    }

    /**
     * Notify participants about room expiration (5 minutes before closing)
     */
    private void notifyRoomExpiration(WatchPartyRoomEntity room) {
        try {
            // Send system message to chat
            messagingTemplate.convertAndSend("/topic/room/" + room.getId() + "/chat",
                    Map.of(
                            "roomId", room.getId(),
                            "message", "This room has expired after 8 hours and will be closed automatically.",
                            "type", "SYSTEM",
                            "metadata", Map.of("eventType", "ROOM_EXPIRING"),
                            "timestamp", LocalDateTime.now().toString()
                    ));

        } catch (Exception e) {
            log.error("Failed to send expiration notification for room: {}", room.getRoomCode(), e);
        }
    }

    /**
     * Send final room closed notification
     */
    private void sendRoomClosedNotification(WatchPartyRoomEntity room, String reason) {
        try {
            messagingTemplate.convertAndSend("/topic/room/" + room.getId() + "/closed",
                    Map.of(
                            "roomId", room.getId(),
                            "roomName", room.getRoomName(),
                            "roomCode", room.getRoomCode(),
                            "closedBy", "System",
                            "reason", reason,
                            "timestamp", LocalDateTime.now().toString(),
                            "message", "Room has been closed automatically after 8 hours."
                    ));

        } catch (Exception e) {
            log.error("Failed to send closed notification for room: {}", room.getRoomCode(), e);
        }
    }

    /**
     * Manually check and expire rooms (for testing or admin use)
     */
    public int forceExpireOldRooms() {
        LocalDateTime now = LocalDateTime.now();
        List<WatchPartyRoomEntity> expiredRooms = roomRepository.findByIsActiveTrueAndExpiresAtBefore(now);

        for (WatchPartyRoomEntity room : expiredRooms) {
            expireRoom(room);
        }

        log.info("Manually expired {} rooms", expiredRooms.size());
        return expiredRooms.size();
    }

    /**
     * Get rooms that will expire soon (within next 30 minutes)
     */
    public List<WatchPartyRoomEntity> getRoomsExpiringSoon() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime soon = now.plusMinutes(30);

        return roomRepository.findByIsActiveTrueAndExpiresAtBetween(now, soon);
    }
}
