package com.castify.backend.models.user;

import com.castify.backend.models.frame.UserFrameModel;
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
    private UserFrameModel usedFrame;
}
