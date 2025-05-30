package com.castify.backend.controller.watchParty;

import com.castify.backend.entity.watchParty.PlaybackSyncEvent;
import com.castify.backend.entity.watchParty.WatchPartyMessageEntity;
import com.castify.backend.entity.watchParty.WatchPartyRoomEntity;
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
                System.out.println("User ID from WebSocket session: " + userId);

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
    public void handleSyncRequest(@DestinationVariable String roomId) {
        try {
            // 1. Get the latest room details
            WatchPartyRoomEntity room = watchPartyService.getRoomDetails(roomId);

            // 2. Send room update to all clients subscribed to this room
            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/update", room);

            // 3. Send current playback state
            PlaybackSyncEvent syncEvent = new PlaybackSyncEvent();
            syncEvent.setRoomId(roomId);
            syncEvent.setPosition(room.getCurrentPosition());
            syncEvent.setPlaying(room.isPlaying());

            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/sync", syncEvent);
        } catch (Exception e) {
            // Log error
            System.err.println("Error handling sync request: " + e.getMessage());
        }
    }
}
