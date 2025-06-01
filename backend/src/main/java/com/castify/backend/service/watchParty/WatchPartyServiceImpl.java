package com.castify.backend.service.watchParty;

import com.castify.backend.entity.PodcastEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.entity.watchParty.PlaybackSyncEvent;
import com.castify.backend.entity.watchParty.WatchPartyMessageEntity;
import com.castify.backend.entity.watchParty.WatchPartyParticipant;
import com.castify.backend.entity.watchParty.WatchPartyRoomEntity;
import com.castify.backend.enums.MessageType;
import com.castify.backend.enums.SyncEventType;
import com.castify.backend.repository.PodcastRepository;
import com.castify.backend.repository.UserRepository;
import com.castify.backend.repository.WatchPartyMessageRepository;
import com.castify.backend.repository.WatchPartyRoomRepository;
import com.castify.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class WatchPartyServiceImpl implements IWatchPartyService {
    private final WatchPartyRoomRepository roomRepository;
    private final WatchPartyMessageRepository messageRepository;
    private final PodcastRepository podcastRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private final Map<String, WatchPartyRoomEntity> activeRooms = new ConcurrentHashMap<>();
    private final UserRepository userRepository;

    @Override
    public WatchPartyRoomEntity createRoom(String podcastId, String roomName, boolean isPublic) {
        UserEntity host = SecurityUtils.getCurrentUser();

        PodcastEntity podcast = podcastRepository.findById(podcastId)
                .orElseThrow(() -> new RuntimeException("Podcast not found"));

        String roomCode = generateUniqueRoomCode();
        WatchPartyRoomEntity room = new WatchPartyRoomEntity();
        room.setRoomCode(roomCode);
        room.setRoomName(roomName != null ? roomName : "Watch Party: " + podcast.getTitle());
        room.setHostUserId(host.getId());
        room.setPodcastId(podcastId);
        room.setPublic(isPublic);
        room.setExpiresAt(LocalDateTime.now().plusHours(8)); // Expire after 8 hours

        // Add host as first participant
        WatchPartyParticipant hostParticipant = new WatchPartyParticipant();
        hostParticipant.setUserId(host.getId());
        hostParticipant.setUsername(host.getUsername());
        hostParticipant.setAvatarUrl(host.getAvatarUrl());
        room.getParticipants().add(hostParticipant);

        // Save to DB and cache
        room = roomRepository.save(room);
        activeRooms.put(room.getId(), room);

        return room;
    }

    @Override
    public WatchPartyRoomEntity joinRoom(String roomCode) {
        UserEntity user = SecurityUtils.getCurrentUser();

        // Tìm room
        WatchPartyRoomEntity room = roomRepository.findByRoomCodeAndIsActiveTrue(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found or expired"));

        if (room.isBanned(user.getId())) {
            throw new RuntimeException("You are banned from this room");
        }

        // Kiểm tra room có full không
        if (room.isFull()) {
            throw new RuntimeException("Room is full");
        }

        // Kiểm tra user đã trong room chưa
        if (room.hasParticipant(user.getId())) {
            // Update online status
            room.getParticipants().stream()
                    .filter(p -> p.getUserId().equals(user.getId()))
                    .findFirst()
                    .ifPresent(p -> {
                        p.setOnline(true);
                        p.setLastSeen(LocalDateTime.now());
                    });
        } else {
            // Add new participant
            WatchPartyParticipant participant = new WatchPartyParticipant();
            participant.setUserId(user.getId());
            participant.setUsername(user.getUsername());
            participant.setAvatarUrl(user.getAvatarUrl());
            room.getParticipants().add(participant);
        }

        // Update room
        room.setLastUpdated(LocalDateTime.now());
        room = roomRepository.save(room);
        activeRooms.put(room.getId(), room);

        // Notify other participants
        notifyRoomParticipants(room.getId(), "USER_JOINED", user.getUsername() + " joined the room");

        messagingTemplate.convertAndSend("/topic/room/" + room.getId() + "/update", room);

        return room;
    }

    @Override
    public void leaveRoom(String roomId) {
        UserEntity user = SecurityUtils.getCurrentUser();

        WatchPartyRoomEntity room = activeRooms.get(roomId);
        if (room == null) {
            room = roomRepository.findById(roomId).orElse(null);
        }

        if (room != null) {
            // Remove participant hoặc set offline
            room.getParticipants().removeIf(p -> p.getUserId().equals(user.getId()));

            // Nếu host leave thì chuyển host hoặc close room
            if (room.isHost(user.getId())) {
                if (!room.getParticipants().isEmpty()) {
                    // Transfer host to first participant
                    WatchPartyParticipant newHost = room.getParticipants().get(0);
                    room.setHostUserId(newHost.getUserId());
                    notifyRoomParticipants(roomId, "HOST_TRANSFERRED",
                            newHost.getUsername() + " is now the host");
                } else {
                    // Close room if no participants left
                    closeRoom(roomId);
                    return;
                }
            }

            room.setLastUpdated(LocalDateTime.now());
            roomRepository.save(room);
            activeRooms.put(roomId, room);

            // Notify other participants
            notifyRoomParticipants(roomId, "USER_LEFT", user.getUsername() + " left the room");
            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/update", room);
        }
    }

    /**
     * Sync playback state
     */
    @Override
    public void syncPlayback(String roomId, long position, boolean isPlaying, SyncEventType eventType, String username) {
        UserEntity user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        WatchPartyRoomEntity room = activeRooms.get(roomId);
        if (room == null) {
            room = roomRepository.findByIdAndIsActiveTrue(roomId).orElse(null);
        }

        if (room == null) {
            throw new RuntimeException("Room not found");
        }

        // Kiểm tra quyền control (nếu hostOnlyControl = true)
        if (room.isHostOnlyControl() && !room.isHost(user.getId())) {
            throw new RuntimeException("Only host can control playback");
        }

        // Update room state
        room.setCurrentPosition(position);
        room.setPlaying(isPlaying);
        room.setLastUpdated(LocalDateTime.now());

        roomRepository.save(room);
        activeRooms.put(roomId, room);

        // Broadcast to all participants
        PlaybackSyncEvent syncEvent = new PlaybackSyncEvent();
        syncEvent.setRoomId(roomId);
        syncEvent.setUserId(user.getId());
        syncEvent.setPosition(position);
        syncEvent.setPlaying(isPlaying);
        syncEvent.setEventType(eventType);

        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/sync", syncEvent);
    }

    @Override
    public WatchPartyMessageEntity sendMessage(String roomId, String message, String username) {
        UserEntity user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        WatchPartyMessageEntity chatMessage = new WatchPartyMessageEntity();
        chatMessage.setRoomId(roomId);
        chatMessage.setUserId(user.getId());
        chatMessage.setUsername(user.getUsername());
        chatMessage.setAvatarUrl(user.getAvatarUrl());
        chatMessage.setMessage(message);
        chatMessage.setType(MessageType.CHAT);

        messageRepository.save(chatMessage);
        return chatMessage;
        // Broadcast to room
//        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/chat", chatMessage);
    }

    @Override
    public WatchPartyRoomEntity getRoomDetails(String roomId) {
        System.out.println("ROOMID = " + roomId);
        WatchPartyRoomEntity room = activeRooms.get(roomId);
        if (room == null) {
            room = roomRepository.findByIdAndIsActiveTrue(roomId).orElse(null);
            if (room != null) {
                activeRooms.put(roomId, room);
            }
        }
        return room;
    }

    @Override
    public List<WatchPartyRoomEntity> getPublicRooms(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return roomRepository.findByIsPublicTrueAndIsActiveTrueOrderByCreatedAtDesc(pageable);
    }

    @Override
    public List<WatchPartyMessageEntity> getRoomMessages(String roomId, int page, int size) {
        UserEntity user = SecurityUtils.getCurrentUser();
        WatchPartyRoomEntity room = getRoomDetails(roomId);

        if (room == null) {
            throw new RuntimeException("Room not found");
        }

        // Kiểm tra user có phải participant không
        if (!room.hasParticipant(user.getId())) {
            throw new RuntimeException("You are not a participant in this room");
        }

        // Lấy messages với pagination, sort theo timestamp desc
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        List<WatchPartyMessageEntity> messages = messageRepository.findByRoomIdOrderByTimestampDesc(roomId, pageable);

        // Reverse list để hiển thị theo thứ tự thời gian tăng dần (cũ -> mới)
        Collections.reverse(messages);

        return messages;
    }

    @Override
    public void kickUser(String roomId, String targetUserId, String reason) {
        UserEntity currentUser = SecurityUtils.getCurrentUser();
        WatchPartyRoomEntity room = getRoomDetails(roomId);

        if (room == null) {
            throw new RuntimeException("Room not found");
        }

        // Check if current user is host
        if (!room.isHost(currentUser.getId())) {
            throw new RuntimeException("Only host can kick users");
        }

        // Check if target user is in room
        if (!room.hasParticipant(targetUserId)) {
            throw new RuntimeException("User is not in this room");
        }

        // Cannot kick yourself
        if (targetUserId.equals(currentUser.getId())) {
            throw new RuntimeException("You cannot kick yourself");
        }

        // Get target user info before removing
        WatchPartyParticipant targetParticipant = room.getParticipants().stream()
                .filter(p -> p.getUserId().equals(targetUserId))
                .findFirst()
                .orElse(null);

        // ✅ Get target user entity để lấy username
        UserEntity targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/kick",
                Map.of(
                        "targetUserId", targetUserId,
                        "targetUsername", targetUser.getUsername(),
                        "roomId", roomId,
                        "roomName", room.getRoomName(),
                        "reason", reason != null ? reason : "No reason provided",
                        "kickedBy", currentUser.getUsername(),
                        "timestamp", LocalDateTime.now().toString()
                )
        );

        System.out.println("🔥 KICK notification sent successfully!");

        // Remove participant from room
        room.getParticipants().removeIf(p -> p.getUserId().equals(targetUserId));
        room.setLastUpdated(LocalDateTime.now());

        // Save room
        roomRepository.save(room);
        activeRooms.put(roomId, room);

        // Send system message
        String kickMessage = targetParticipant != null
                ? targetParticipant.getUsername() + " was kicked from the room"
                : "A user was kicked from the room";
        if (reason != null && !reason.trim().isEmpty()) {
            kickMessage += " (" + reason + ")";
        }

        notifyRoomParticipants(roomId, "USER_KICKED", kickMessage);

        // Broadcast room update
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/update", room);
    }

    @Override
    public void banUser(String roomId, String targetUserId, String reason) {
        UserEntity currentUser = SecurityUtils.getCurrentUser();
        WatchPartyRoomEntity room = getRoomDetails(roomId);

        if (room == null) {
            throw new RuntimeException("Room not found");
        }

        // Check if current user is host
        if (!room.isHost(currentUser.getId())) {
            throw new RuntimeException("Only host can ban users");
        }

        // Cannot ban yourself
        if (targetUserId.equals(currentUser.getId())) {
            throw new RuntimeException("You cannot ban yourself");
        }

        // Get target user info
        UserEntity targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/ban",
                Map.of(
                        "targetUserId", targetUserId,
                        "targetUsername", targetUser.getUsername(),
                        "roomId", roomId,
                        "roomName", room.getRoomName(),
                        "reason", reason != null ? reason : "No reason provided",
                        "bannedBy", currentUser.getUsername(),
                        "timestamp", LocalDateTime.now().toString()
                )
        );

        // Add to banned list
        room.banUser(targetUserId);

        // Remove from participants if present
        room.getParticipants().removeIf(p -> p.getUserId().equals(targetUserId));
        room.setLastUpdated(LocalDateTime.now());

        // Save room
        roomRepository.save(room);
        activeRooms.put(roomId, room);

        // Send system message
        String banMessage = targetUser.getUsername() + " was banned from the room";
        if (reason != null && !reason.trim().isEmpty()) {
            banMessage += " (" + reason + ")";
        }

        notifyRoomParticipants(roomId, "USER_BANNED", banMessage);

        // Broadcast room update
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/update", room);
    }

    @Override
    public void unbanUser(String roomId, String targetUserId) {
        UserEntity currentUser = SecurityUtils.getCurrentUser();
        WatchPartyRoomEntity room = getRoomDetails(roomId);

        if (room == null) {
            throw new RuntimeException("Room not found");
        }

        // Check if current user is host
        if (!room.isHost(currentUser.getId())) {
            throw new RuntimeException("Only host can unban users");
        }

        // Remove from banned list
        room.unbanUser(targetUserId);
        room.setLastUpdated(LocalDateTime.now());

        // Save room
        roomRepository.save(room);
        activeRooms.put(roomId, room);

        // Get target user info
        UserEntity targetUser = userRepository.findById(targetUserId)
                .orElse(null);

        // Send system message
        String unbanMessage = targetUser != null
                ? targetUser.getUsername() + " was unbanned"
                : "A user was unbanned";

        notifyRoomParticipants(roomId, "USER_UNBANNED", unbanMessage);
    }

    @Override
    public void deleteMessage(String roomId, String messageId) {
        UserEntity currentUser = SecurityUtils.getCurrentUser();

        // Get the message
        WatchPartyMessageEntity message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        // Check if user is the author of the message
        if (!message.getUserId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only delete your own messages");
        }

        // Check if message belongs to the room
        if (!message.getRoomId().equals(roomId)) {
            throw new RuntimeException("Message does not belong to this room");
        }

        // Delete the message
        messageRepository.delete(message);

        // Notify room participants about deleted message
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/message-deleted",
                Map.of("messageId", messageId, "userId", currentUser.getId()));
    }

    /*
    * Helper method
    * */
    private String generateUniqueRoomCode() {
        String code;
        do {
            code = String.format("%06d", (int)(Math.random() * 1000000));
        } while (roomRepository.existsByRoomCodeAndIsActiveTrue(code));
        return code;
    }

    private void notifyRoomParticipants(String roomId, String eventType, String message) {
        WatchPartyMessageEntity systemMessage = new WatchPartyMessageEntity();
        systemMessage.setRoomId(roomId);
        systemMessage.setMessage(message);
        systemMessage.setType(MessageType.SYSTEM);
        systemMessage.getMetadata().put("eventType", eventType);

        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/chat", systemMessage);
    }

    private void closeRoom(String roomId) {
        WatchPartyRoomEntity room = activeRooms.get(roomId);
        if (room != null) {
            room.setActive(false);
            roomRepository.save(room);
            activeRooms.remove(roomId);

            // Notify all participants
            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/system",
                    Map.of("eventType", "ROOM_CLOSED", "message", "Room has been closed"));
        }
    }

}
