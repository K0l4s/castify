package com.castify.backend.models.playlist;

import com.castify.backend.entity.PlaylistItem;
import com.castify.backend.models.user.UserModel;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PlaylistModel {
    private String id;
    private String name;
    private String description;
    private boolean publish; // true: public, false: private

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastUpdated;

    private UserModel owner;
    private List<PlaylistItem> items;
}
