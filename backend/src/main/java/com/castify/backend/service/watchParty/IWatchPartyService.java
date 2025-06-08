package com.castify.backend.service.watchParty;

import com.castify.backend.entity.watchParty.WatchPartyMessageEntity;
import com.castify.backend.entity.watchParty.WatchPartyRoomEntity;
import com.castify.backend.enums.SyncEventType;
import com.castify.backend.models.PageDTO;
import com.castify.backend.models.watchParty.EditWatchPartyRoomDTO;
import com.castify.backend.models.watchParty.WatchPartyRoomModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface IWatchPartyService {
    WatchPartyRoomEntity createRoom(String podcastId, String roomName, boolean isPublic);
    WatchPartyRoomEntity editRoom(String roomId, EditWatchPartyRoomDTO editWatchPartyRoomDTO);
    WatchPartyRoomEntity joinRoom(String roomCode);
    void leaveRoom(String roomId);
    void forceCloseRoom(String roomId);
    WatchPartyRoomEntity changePodcast(String roomId, String newPodcastId);
    void syncPlayback(String roomId, long position, boolean isPlaying, SyncEventType eventType, String username);
    WatchPartyMessageEntity sendMessage(String roomId, String message, String username);
    WatchPartyRoomEntity getRoomDetails(String roomId);
    PageDTO<WatchPartyRoomEntity> getPublicRooms(int page, int size,  String excludeUserId);
    PageDTO<WatchPartyRoomEntity> getMyRooms(int page, int size);
    WatchPartyRoomEntity getRoomByCode(String roomCode);
    List<WatchPartyMessageEntity> getRoomMessages(String roomId, int page, int size);
    void kickUser(String roomId, String targetUserId, String reason);
    void banUser(String roomId, String targetUserId, String reason);
    void unbanUser(String roomId, String targetUserId);
    void deleteMessage(String roomId, String messageId);
    List<Map<String, Object>> getBannedUsers(String roomId);

    WatchPartyRoomEntity extendRoomExpiration(String roomId, int additionalHours);
    Map<String, Object> getRoomExpirationInfo(String roomId);
    Page<WatchPartyRoomModel> searchRooms(String keyword, Pageable pageable);
}
