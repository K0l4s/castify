package com.castify.backend.controller.watchParty;

import com.castify.backend.entity.watchParty.WatchPartyRoomEntity;
import com.castify.backend.models.watchParty.CreateRoomRequest;
import com.castify.backend.service.watchParty.IWatchPartyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
                    request.isPublic()
            );
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

    @GetMapping("/{roomId}")
    public ResponseEntity<WatchPartyRoomEntity> getRoomDetails(@PathVariable String roomId) {
        WatchPartyRoomEntity room = watchPartyService.getRoomDetails(roomId);
        return room != null ? ResponseEntity.ok(room) : ResponseEntity.notFound().build();
    }

    @GetMapping("/public")
    public ResponseEntity<List<WatchPartyRoomEntity>> getPublicRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<WatchPartyRoomEntity> rooms = watchPartyService.getPublicRooms(page, size);
        return ResponseEntity.ok(rooms);
    }
}
