package com.castify.backend.models.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShortUser {
    private String id;
    private String fullname;
    private String username;
    private String avatarUrl;
}
