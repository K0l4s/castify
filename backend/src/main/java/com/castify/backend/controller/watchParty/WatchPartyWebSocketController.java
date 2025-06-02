package com.castify.backend.controller.watchParty;

import com.castify.backend.entity.watchParty.PlaybackSyncEvent;
import com.castify.backend.entity.watchParty.WatchPartyMessageEntity;
import com.castify.backend.entity.watchParty.WatchPartyRoomEntity;
import com.castify.backend.enums.SyncEventType;
import com.castify.backend.models.watchParty.ChatMessageRequest;
import com.castify.backend.service.watchParty.IWatchPartyService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class WatchPartyWebSocketController {
    private final IWatchPartyService watchPartyService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Handle playback sync messages
     */
    @MessageMapping("/room/{roomId}/sync")
    @SendTo("/topic/room/{roomId}/sync")
    public PlaybackSyncEvent handlePlaybackSync(@DestinationVariable String roomId,
                                                @Payload PlaybackSyncEvent syncEvent,
                                                SimpMessageHeaderAccessor headerAccessor) {
        try {
            Principal user = headerAccessor.getUser();
            if (user != null) {
                String userId = user.getName();

                syncEvent.setUserId(userId);
                syncEvent.setRoomId(roomId);

                watchPartyService.syncPlayback(
                        roomId,
                        syncEvent.getPosition(),
                        syncEvent.isPlaying(),
                        syncEvent.getEventType(),
                        user.getName()
                );
                return syncEvent;
            } else {
                System.err.println("No authenticated user found in WebSocket session");
                return null;
            }
        } catch (Exception e) {
            // Handle error
            System.err.println("Error handling playback sync: " + e.getMessage());
            return null;
        }
    }

    /**
     * Handle chat messages
     */
    @MessageMapping("/room/{roomId}/chat")
    @SendTo("/topic/room/{roomId}/chat")
    public WatchPartyMessageEntity handleChatMessage(@DestinationVariable String roomId,
                                                     @Payload ChatMessageRequest request,
                                                     SimpMessageHeaderAccessor headerAccessor) {
        try {
            // Get user information from security context
            Principal user = headerAccessor.getUser();
            System.out.println("Processing chat message from user: " + user);

            return watchPartyService.sendMessage(roomId, request.getMessage(), user.getName());
        } catch (Exception e) {
            System.err.println("Error handling chat message: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Handle sync request - when client requests current room state
     */
    @MessageMapping("/room/{roomId}/sync-request")
    public void handleSyncRequest(@DestinationVariable String roomId, SimpMessageHeaderAccessor headerAccessor) {
        try {
            Principal user = headerAccessor.getUser();
            if (user == null) {
                System.err.println("No authenticated user for sync request");
                return;
            }

            System.out.println("Sync requested by user: " + user.getName());
            WatchPartyRoomEntity room = watchPartyService.getRoomDetails(roomId);

            if (room == null) {
                System.err.println("Room not found with ID: " + roomId);
                return;
            }

            // GỬI YÊU CẦU ĐẾN HOST để lấy position hiện tại
            PlaybackSyncEvent hostSyncRequest = new PlaybackSyncEvent();
            hostSyncRequest.setRoomId(roomId);
            hostSyncRequest.setEventType(SyncEventType.SYNC_REQUEST);
            hostSyncRequest.setUserId(user.getName());

            // Gửi sync request đến riêng host qua user queue
            messagingTemplate.convertAndSendToUser(
                    room.getHostUserId(),
                    "/queue/sync-request",
                    hostSyncRequest
            );

            System.out.println("Sync request sent to host: " + room.getHostUserId());

        } catch (Exception e) {
            System.err.println("Error handling sync request: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
