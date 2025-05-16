package com.castify.backend.models.playlist;

import com.castify.backend.entity.PodcastEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.models.podcast.PodcastModel;
import com.castify.backend.models.user.UserModel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PlaylistModel {
    private String id;
    private String name;
    private String description;
    private boolean isPublic; // true: public, false: private
    private LocalDateTime createdDate;
    private LocalDateTime lastUpdated;
    private UserModel owner;
    private List<PodcastModel> podcasts;
}
