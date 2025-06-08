package com.castify.backend.service.watchParty;

import com.castify.backend.entity.PodcastEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.entity.watchParty.PlaybackSyncEvent;
import com.castify.backend.entity.watchParty.WatchPartyMessageEntity;
import com.castify.backend.entity.watchParty.WatchPartyParticipant;
import com.castify.backend.entity.watchParty.WatchPartyRoomEntity;
import com.castify.backend.enums.MessageType;
import com.castify.backend.enums.SyncEventType;
import com.castify.backend.models.PageDTO;
import com.castify.backend.models.watchParty.EditWatchPartyRoomDTO;
import com.castify.backend.models.watchParty.WatchPartyRoomModel;
import com.castify.backend.repository.PodcastRepository;
import com.castify.backend.repository.UserRepository;
import com.castify.backend.repository.WatchPartyMessageRepository;
import com.castify.backend.repository.WatchPartyRoomRepository;
import com.castify.backend.utils.SecurityUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WatchPartyServiceImpl implements IWatchPartyService {
    private final WatchPartyRoomRepository roomRepository;
    private final WatchPartyMessageRepository messageRepository;
    private final PodcastRepository podcastRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private final Map<String, WatchPartyRoomEntity> activeRooms = new ConcurrentHashMap<>();
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;
    private final ModelMapper modelMapper;

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
        room.setPodcastThumbnail(podcast.getThumbnailUrl());
        room.setPublish(isPublic);
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
    public WatchPartyRoomEntity editRoom(String roomId, EditWatchPartyRoomDTO editRequest) {
        UserEntity currentUser = SecurityUtils.getCurrentUser();
        WatchPartyRoomEntity room = getRoomDetails(roomId);

        if (room == null) {
            throw new RuntimeException("Room not found");
        }

        if (!room.isHost(currentUser.getId())) {
            throw new RuntimeException("Only host can edit settings");
        }

        String oldRoomName = room.getRoomName();
        boolean oldAllowChat = room.isAllowChat();
        boolean oldIsPublic = room.isPublish();

        // Update room settings
        if (editRequest.getRoomName() != null && !editRequest.getRoomName().trim().isEmpty()) {
            room.setRoomName(editRequest.getRoomName().trim());
        }
        room.setPublish(editRequest.isPublish());
        room.setAllowChat(editRequest.isAllowChat());
        room.setLastUpdated(LocalDateTime.now());

        roomRepository.save(room);
        activeRooms.put(roomId, room);

        List<String> changes = new ArrayList<>();

        if (!oldRoomName.equals(room.getRoomName())) {
            changes.add("Room name changed to: " + room.getRoomName());
        }

        if (oldAllowChat != room.isAllowChat()) {
            changes.add("Chat " + (room.isAllowChat() ? "enabled" : "disabled"));
        }

        if (oldIsPublic != room.isPublish()) {
            changes.add("Room is now " + (room.isPublish() ? "public" : "private"));
        }

        // Send system messages for each change
        for (String change : changes) {
            notifyRoomParticipants(roomId, "ROOM_SETTINGS_UPDATED",
                    "Host updated room settings: " + change);
        }

        // Broadcast messages
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/update", room);

        Map<String, Object> settingsUpdate = new HashMap<>();
        settingsUpdate.put("roomName", room.getRoomName());
        settingsUpdate.put("allowChat", room.isAllowChat());
        settingsUpdate.put("isPublic", room.isPublish());
        settingsUpdate.put("updatedBy", currentUser.getUsername());
        settingsUpdate.put("timestamp", LocalDateTime.now().toString());

        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/settings-update", settingsUpdate);

        return room;
    }

    @Override
    public WatchPartyRoomEntity joinRoom(String roomCode) {
        UserEntity user = SecurityUtils.getCurrentUser();

        // Tìm room
        WatchPartyRoomEntity room = roomRepository.findByRoomCodeAndIsActiveTrue(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found or expired"));

        if (room.getExpiresAt() != null && room.getExpiresAt().isBefore(LocalDateTime.now())) {
            // Auto-expire the room
            room.setActive(false);
            roomRepository.save(room);
            throw new RuntimeException("Room has expired and is no longer available");
        }

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

    @Override
    @Transactional
    public void forceCloseRoom(String roomId) {
        UserEntity currentUser = SecurityUtils.getCurrentUser();
        // Remove all participants
        WatchPartyRoomEntity room = activeRooms.get(roomId);

        if (room == null) {
            room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Room not found"));
        }

        if (!room.isHost(currentUser.getId())) {
            throw new RuntimeException("Only host can close the room");
        }

        room.getParticipants().clear();
        messageRepository.deleteByRoomId(roomId);

        notifyRoomParticipants(roomId, "ROOM_CLOSED",
                "The room has been closed by the host");

        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/closed",
                Map.of(
                        "roomId", roomId,
                        "roomName", room.getRoomName(),
                        "closedBy", currentUser.getUsername(),
                        "timestamp", LocalDateTime.now().toString(),
                        "message", "The room has been closed by the host"
                )
        );

        // Close room
        room.setActive(false);
        room.setLastUpdated(LocalDateTime.now());

        // Save to database
        roomRepository.save(room);

        // Remove from active rooms cache
        activeRooms.remove(roomId);
    }

    @Override
    public WatchPartyRoomEntity changePodcast(String roomId, String newPodcastId) {
        UserEntity currentUser = SecurityUtils.getCurrentUser();
        WatchPartyRoomEntity room = getRoomDetails(roomId);

        if (room == null) {
            throw new RuntimeException("Room not found");
        }

        // Check if current user is host
        if (!room.isHost(currentUser.getId())) {
            throw new RuntimeException("Only host can change the podcast");
        }

        // Verify new podcast exists
        PodcastEntity newPodcast = podcastRepository.findByIdAndIsActiveTrue(newPodcastId)
                .orElseThrow(() -> new RuntimeException("Podcast not found"));

        // Store old podcast info for notification
        PodcastEntity oldPodcast = podcastRepository.findById(room.getPodcastId()).orElse(null);
        String oldPodcastTitle = oldPodcast != null ? oldPodcast.getTitle() : "Unknown";

        // Update room
        room.setPodcastId(newPodcastId);
        room.setPodcastThumbnail(newPodcast.getThumbnailUrl());
        room.setCurrentPosition(0); // Reset to beginning
        room.setPlaying(false); // Pause by default
        room.setLastUpdated(LocalDateTime.now());

        // Save to database
        roomRepository.save(room);
        activeRooms.put(roomId, room);

        // Send system message
        String changeMessage = String.format("Host changed the video from \"%s\" to \"%s\"",
                oldPodcastTitle, newPodcast.getTitle());
        notifyRoomParticipants(roomId, "PODCAST_CHANGED", changeMessage);

        // Send podcast change notification via WebSocket
        Map<String, Object> podcastChangeData = Map.of(
                "roomId", roomId,
                "newPodcastId", newPodcastId,
                "newPodcastTitle", newPodcast.getTitle(),
                "newPodcastUrl", newPodcast.getVideoUrl(),
                "newThumbnailUrl", newPodcast.getThumbnailUrl() != null ? newPodcast.getThumbnailUrl() : "",
                "changedBy", currentUser.getUsername(),
                "timestamp", LocalDateTime.now().toString(),
                "message", changeMessage
        );

        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/podcast-changed", podcastChangeData);

        // Broadcast room update
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/update", room);

        System.out.println(" Podcast changed successfully in room: " + roomId);
        return room;
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
        WatchPartyRoomEntity room = activeRooms.get(roomId);
        if (room == null) {
            room = roomRepository.findByIdAndIsActiveTrue(roomId).orElse(null);
            if (room != null) {
                if (room.getExpiresAt() != null && room.getExpiresAt().isBefore(LocalDateTime.now())) {
                    // Auto-expire the room
                    room.setActive(false);
                    roomRepository.save(room);
                    activeRooms.remove(roomId);
                    return null; // Room expired
                }
                activeRooms.put(roomId, room);
            }
        }
        return room;
    }

    @Override
    public PageDTO<WatchPartyRoomEntity> getPublicRooms(int page, int size, String excludeUserId) {
        Pageable pageable = PageRequest.of(page, size);
        List<WatchPartyRoomEntity> rooms;
        long totalElements;

        if (excludeUserId != null) {
            rooms = roomRepository.findByPublishTrueAndIsActiveTrueAndHostUserIdNotOrderByCreatedAtDesc(
                    excludeUserId, pageable);
            totalElements = roomRepository.countByPublishTrueAndIsActiveTrueAndHostUserIdNot(excludeUserId);
        } else {
            rooms = roomRepository.findByPublishTrueAndIsActiveTrueOrderByCreatedAtDesc(pageable);
            totalElements = roomRepository.countByPublishTrueAndIsActiveTrue();
        }

        int totalPages = (int) Math.ceil((double) totalElements / size);
        return new PageDTO<>(rooms, page, totalPages, (int) totalElements);
    }

    @Override
    public PageDTO<WatchPartyRoomEntity> getMyRooms(int page, int size) {
        UserEntity currentUser = SecurityUtils.getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);

        List<WatchPartyRoomEntity> rooms = roomRepository.findByHostUserIdAndIsActiveTrueOrderByCreatedAtDesc(
                currentUser.getId(), pageable);

        long totalElements = roomRepository.countByHostUserIdAndIsActiveTrue(currentUser.getId());
        int totalPages = (int) Math.ceil((double) totalElements / size);

        return new PageDTO<>(rooms, page, totalPages, (int) totalElements);
    }

    @Override
    public WatchPartyRoomEntity getRoomByCode(String roomCode) {
        return roomRepository.findByRoomCodeAndIsActiveTrue(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found or expired"));
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

    @Override
    public List<Map<String, Object>> getBannedUsers(String roomId) {
        UserEntity currentUser = SecurityUtils.getCurrentUser();
        WatchPartyRoomEntity room = getRoomDetails(roomId);

        if (room == null) {
            throw new RuntimeException("Room not found");
        }

        // Check if current user is host
        if (!room.isHost(currentUser.getId())) {
            throw new RuntimeException("Only host can view banned users");
        }

        List<Map<String, Object>> bannedUsers = new ArrayList<>();

        for (String bannedUserId : room.getBannedUserIds()) {
            UserEntity user = userRepository.findById(bannedUserId).orElse(null);
            if (user != null) {
                Map<String, Object> bannedUser = new HashMap<>();
                bannedUser.put("id", user.getId());
                bannedUser.put("username", user.getUsername());
                bannedUser.put("fullName", user.getFullname());
                bannedUser.put("avatarUrl", user.getAvatarUrl());
                bannedUser.put("usedFrame", user.getUsedFrame());
                bannedUsers.add(bannedUser);
            }
        }

        return bannedUsers;
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
            messageRepository.deleteByRoomId(roomId);

            // Notify all participants
            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/system",
                    Map.of("eventType", "ROOM_CLOSED", "message", "Room has been closed"));
        }
    }

    // method to extend room expiration (for hosts)
    @Override
    public WatchPartyRoomEntity extendRoomExpiration(String roomId, int additionalHours) {
        UserEntity currentUser = SecurityUtils.getCurrentUser();
        WatchPartyRoomEntity room = getRoomDetails(roomId);

        if (room == null) {
            throw new RuntimeException("Room not found");
        }

        if (!room.isHost(currentUser.getId())) {
            throw new RuntimeException("Only host can extend room expiration");
        }

        // Extend expiration by additional hours
        LocalDateTime newExpiration = room.getExpiresAt().plusHours(additionalHours);
        room.setExpiresAt(newExpiration);
        room.setLastUpdated(LocalDateTime.now());

        roomRepository.save(room);
        activeRooms.put(roomId, room);

        // Send WebSocket notification for expiration update
        sendExpirationUpdateNotification(roomId, newExpiration, additionalHours, currentUser.getUsername());

        // Notify participants
        notifyRoomParticipants(roomId, "ROOM_EXTENDED",
                String.format("Host extended room time by %d hours. ",
                        additionalHours));

        return room;
    }

    // method to get room expiration info
    @Override
    public Map<String, Object> getRoomExpirationInfo(String roomId) {
        WatchPartyRoomEntity room = getRoomDetails(roomId);

        if (room == null) {
            throw new RuntimeException("Room not found");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = room.getExpiresAt();

        long minutesRemaining = java.time.Duration.between(now, expiresAt).toMinutes();
        boolean isExpiringSoon = minutesRemaining <= 30; // Less than 30 minutes

        return Map.of(
                "expiresAt", expiresAt.toString(),
                "minutesRemaining", Math.max(0, minutesRemaining),
                "isExpiringSoon", isExpiringSoon,
                "canExtend", room.isHost(SecurityUtils.getCurrentUser().getId())
        );
    }

    @Override
    public Page<WatchPartyRoomModel> searchRooms(String keyword, Pageable pageable) {
        try {
            // Tạo query tìm kiếm theo roomName và roomCode
            Criteria criteria = new Criteria().orOperator(
                            Criteria.where("roomName").regex(keyword, "i"),
                            Criteria.where("roomCode").regex(keyword, "i")
                    ).and("isActive").is(true)
                    .and("publish").is(true); // Chỉ search public rooms

            Query query = new Query(criteria);

            // Count total elements
            long totalElements = mongoTemplate.count(query, WatchPartyRoomEntity.class);

            // Apply pagination and sort by creation date
            query.with(pageable);
            List<WatchPartyRoomEntity> roomEntities = mongoTemplate.find(query, WatchPartyRoomEntity.class);

            // Convert to models
            List<WatchPartyRoomModel> roomModels = roomEntities.stream()
                    .map(room -> {
                        WatchPartyRoomModel model = modelMapper.map(room, WatchPartyRoomModel.class);

                        // Add additional info
                        model.setMaxParticipants(100);
                        model.setHostUserId(room.getHostUserId());
                        model.setHostUsername(getHostUsername(room.getHostUserId()));

                        return model;
                    })
                    .collect(Collectors.toList());

            return new PageImpl<>(roomModels, pageable, totalElements);

        } catch (Exception e) {
            log.error("Error searching watch party rooms with keyword: {}", keyword, e);
            return Page.empty(pageable);
        }
    }

    private void sendExpirationUpdateNotification(String roomId, LocalDateTime newExpiration, int additionalHours, String hostUsername) {
        try {
            Map<String, Object> expirationUpdate = Map.of(
                    "roomId", roomId,
                    "newExpiresAt", newExpiration.toString(),
                    "additionalHours", additionalHours,
                    "extendedBy", hostUsername,
                    "timestamp", LocalDateTime.now().toString(),
                    "eventType", "ROOM_EXTENDED"
            );

            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/expiration-update", expirationUpdate);

            log.info("Sent expiration update notification for room: {} - New expiration: {}", roomId, newExpiration);
        } catch (Exception e) {
            log.error("Failed to send expiration update notification for room: {}", roomId, e);
        }
    }

    // Helper method to get host username
    private String getHostUsername(String hostUserId) {
        try {
            UserEntity host = userRepository.findById(hostUserId).orElse(null);
            return host != null ? host.getUsername() : "Unknown";
        } catch (Exception e) {
            return "Unknown";
        }
    }
}
