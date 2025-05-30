package com.castify.backend.models.watchParty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateRoomRequest {
    private String podcastId;
    private String roomName;
    private boolean isPublic = true;
}
