package com.castify.backend.controller.watchParty;

import com.castify.backend.entity.watchParty.WatchPartyRoomEntity;
import com.castify.backend.service.watchParty.IWatchPartyCleanupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/watch-party")
@RequiredArgsConstructor
public class AdminWatchPartyController {
    private final IWatchPartyCleanupService cleanupService;

    // ✅ Admin endpoint to force cleanup (optional)
    @PostMapping("/cleanup")
    public ResponseEntity<Map<String, Object>> forceCleanup() {
        try {
            int expiredCount = cleanupService.forceExpireOldRooms();
            return ResponseEntity.ok(Map.of(
                    "expiredRooms", expiredCount,
                    "message", "Cleanup completed successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ Get rooms expiring soon (admin/monitoring)
    @GetMapping("/expiring-soon")
    public ResponseEntity<List<WatchPartyRoomEntity>> getRoomsExpiringSoon() {
        try {
            List<WatchPartyRoomEntity> expiringSoon = cleanupService.getRoomsExpiringSoon();
            return ResponseEntity.ok(expiringSoon);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
