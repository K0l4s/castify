package com.castify.backend.models.watchParty;

import lombok.Data;

@Data
public class EditWatchPartyRoomDTO {
    private String roomName;
    private boolean publish;
    private boolean allowChat;
}
