package com.castify.backend.models.watchParty;

import lombok.Data;

@Data
public class BanUserRequest {
    private String userId;
    private String reason;
}