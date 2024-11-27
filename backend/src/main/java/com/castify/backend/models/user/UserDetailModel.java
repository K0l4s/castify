package com.castify.backend.models.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailModel {
    private String id;
    private String fullname;
    private String username;
    private String avatarUrl;
    private String coverUrl;
    private LocalDateTime birthday;
    private String address;
    private String phone;
    private String email;
    private List<String> badgesId;
    private boolean isFollow;
    private long totalFollower;
    private long totalFollowing;
    private long totalPost;
    private List<String> following = new ArrayList<>();


    public void setIsFollow(boolean follow) {
        this.isFollow=follow;
    }
}
