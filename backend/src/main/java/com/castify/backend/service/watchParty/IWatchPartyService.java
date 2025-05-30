package com.castify.backend.service.watchParty;

import com.castify.backend.entity.watchParty.WatchPartyMessageEntity;
import com.castify.backend.entity.watchParty.WatchPartyRoomEntity;
import com.castify.backend.enums.SyncEventType;

import java.util.List;

public interface IWatchPartyService {
    WatchPartyRoomEntity createRoom(String podcastId, String roomName, boolean isPublic);
    WatchPartyRoomEntity joinRoom(String roomCode);
    void leaveRoom(String roomId);
    void syncPlayback(String roomId, long position, boolean isPlaying, SyncEventType eventType, String username);
    WatchPartyMessageEntity sendMessage(String roomId, String message, String username);
    WatchPartyRoomEntity getRoomDetails(String roomId);
    List<WatchPartyRoomEntity> getPublicRooms(int page, int size);
}
