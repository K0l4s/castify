package com.castify.backend.controller.watchParty;

import com.castify.backend.entity.UserEntity;
import com.castify.backend.entity.watchParty.WatchPartyMessageEntity;
import com.castify.backend.entity.watchParty.WatchPartyRoomEntity;
import com.castify.backend.models.PageDTO;
import com.castify.backend.models.watchParty.BanUserRequest;
import com.castify.backend.models.watchParty.CreateRoomRequest;
import com.castify.backend.models.watchParty.EditWatchPartyRoomDTO;
import com.castify.backend.models.watchParty.KickUserRequest;
import com.castify.backend.service.watchParty.IWatchPartyService;
import com.castify.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/watch-party")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class WatchPartyController {
    private final IWatchPartyService watchPartyService;

    @PostMapping("/create")
    public ResponseEntity<WatchPartyRoomEntity> createRoom(@RequestBody CreateRoomRequest request) {
        try {
            WatchPartyRoomEntity room = watchPartyService.createRoom(
                    request.getPodcastId(),
                    request.getRoomName(),
                    request.isPublish()
            );
            return ResponseEntity.ok(room);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{roomId}/edit")
    public ResponseEntity<WatchPartyRoomEntity> editRoom(@PathVariable String roomId,
                                                         @RequestBody EditWatchPartyRoomDTO editRequest) {
        try {
            WatchPartyRoomEntity room = watchPartyService.editRoom(roomId, editRequest);
            return ResponseEntity.ok(room);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/join/{roomCode}")
    public ResponseEntity<WatchPartyRoomEntity> joinRoom(@PathVariable String roomCode) {
        try {
            WatchPartyRoomEntity room = watchPartyService.joinRoom(roomCode);
            return ResponseEntity.ok(room);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/leave/{roomId}")
    public ResponseEntity<Void> leaveRoom(@PathVariable String roomId) {
        try {
            watchPartyService.leaveRoom(roomId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/close/{roomId}")
    public ResponseEntity<?> closeRoom(@PathVariable String roomId) {
        try {
            watchPartyService.forceCloseRoom(roomId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{roomId}/change-podcast")
    public ResponseEntity<WatchPartyRoomEntity> changePodcast(@PathVariable String roomId,
                                                              @RequestBody Map<String, String> request) {
        try {
            String newPodcastId = request.get("podcastId");
            if (newPodcastId == null || newPodcastId.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            WatchPartyRoomEntity room = watchPartyService.changePodcast(roomId, newPodcastId);
            return ResponseEntity.ok(room);
        } catch (Exception e) {
            System.err.println("Error changing podcast: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<WatchPartyRoomEntity> getRoomDetails(@PathVariable String roomId) {
        WatchPartyRoomEntity room = watchPartyService.getRoomDetails(roomId);
        return room != null ? ResponseEntity.ok(room) : ResponseEntity.notFound().build();
    }

    @GetMapping("/public")
    public ResponseEntity<PageDTO<WatchPartyRoomEntity>> getPublicRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "true") boolean excludeMyRooms) {

        String excludeUserId = null;
        if (excludeMyRooms) {
            UserEntity currentUser = SecurityUtils.getCurrentUser();
            excludeUserId = currentUser.getId();
        }

        PageDTO<WatchPartyRoomEntity> rooms = watchPartyService.getPublicRooms(page, size, excludeUserId);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/my-rooms")
    public ResponseEntity<PageDTO<WatchPartyRoomEntity>> getMyRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageDTO<WatchPartyRoomEntity> rooms = watchPartyService.getMyRooms(page, size);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/room/{roomCode}")
    public ResponseEntity<WatchPartyRoomEntity> getRoomByCode(@PathVariable String roomCode) {
        WatchPartyRoomEntity room = watchPartyService.getRoomByCode(roomCode);
        return ResponseEntity.ok(room);
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<WatchPartyMessageEntity>> getRoomMessages(
            @PathVariable String roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            List<WatchPartyMessageEntity> messages = watchPartyService.getRoomMessages(roomId, page, size);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{roomId}/kick")
    public ResponseEntity<Void> kickUser(@PathVariable String roomId,
                                         @RequestBody KickUserRequest request) {
        try {
            watchPartyService.kickUser(roomId, request.getUserId(), request.getReason());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{roomId}/ban")
    public ResponseEntity<Void> banUser(@PathVariable String roomId,
                                        @RequestBody BanUserRequest request) {
        try {
            watchPartyService.banUser(roomId, request.getUserId(), request.getReason());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{roomId}/unban")
    public ResponseEntity<Void> unbanUser(@PathVariable String roomId,
                                          @RequestBody Map<String, String> request) {
        try {
            watchPartyService.unbanUser(roomId, request.get("userId"));
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{roomId}/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable String roomId,
                                              @PathVariable String messageId) {
        try {
            watchPartyService.deleteMessage(roomId, messageId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{roomId}/banned-users")
    public ResponseEntity<List<Map<String, Object>>> getBannedUsers(@PathVariable String roomId) {
        try {
            List<Map<String, Object>> bannedUsers = watchPartyService.getBannedUsers(roomId);
            return ResponseEntity.ok(bannedUsers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
