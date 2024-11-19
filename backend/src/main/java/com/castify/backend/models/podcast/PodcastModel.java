package com.castify.backend.models.podcast;

import com.castify.backend.entity.CommentEntity;
import com.castify.backend.entity.PodcastLikeEntity;
import com.castify.backend.models.user.UserModel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class PodcastModel {
    private String id;
    private String title;
    private String content;
    private String thumbnailUrl;
    private String videoUrl;
    private long views;
    private long totalLikes;
    private long totalComments;
    private String username;
    private LocalDateTime createdDay;
    private LocalDateTime lastEdited;
    private boolean isActive;

//    private List<CommentEntity> comments;
//    private List<PodcastLikeEntity> likes;

//    private UserModel user;
}
