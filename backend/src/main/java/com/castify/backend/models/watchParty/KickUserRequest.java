package com.castify.backend.models.watchParty;

import lombok.Data;

@Data
public class KickUserRequest {
    private String userId;
    private String reason;
}