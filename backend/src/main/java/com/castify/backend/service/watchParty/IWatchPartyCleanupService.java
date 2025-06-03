package com.castify.backend.service.watchParty;

import com.castify.backend.entity.watchParty.WatchPartyRoomEntity;

import java.util.List;

public interface IWatchPartyCleanupService {
    void expireRooms();
    void cleanupOldRooms();
    int forceExpireOldRooms();
    List<WatchPartyRoomEntity> getRoomsExpiringSoon();
}
