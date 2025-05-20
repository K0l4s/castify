package com.castify.backend.entity;

import com.castify.backend.models.user.UserModel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PlaylistItem {
    private String podcastId;
    private String thumbnail;
    private long duration;
    private String title;
    private String description;
    private String owner;
    private int order;
}
