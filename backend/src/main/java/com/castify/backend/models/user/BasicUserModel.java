package com.castify.backend.models.user;

import com.castify.backend.entity.location.WardEntity;
import com.castify.backend.enums.Role;
import com.castify.backend.models.frame.UserFrameModel;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BasicUserModel {
    private String id;
    private String fullname;
    private String username;
    private String avatarUrl;
    private UserFrameModel usedFrame;
    private String coverUrl;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime birthday;
    private String address;
    private String phone;
    private String email;
    private List<String> badgesId;
//    @Enumerated(EnumType.STRING)
    private Role role;
    private boolean isActive;
    private boolean isNonLocked;
    private boolean isNonBanned;
    private long totalFollower;
    private long totalFollowing;
    private long totalPost;
}
