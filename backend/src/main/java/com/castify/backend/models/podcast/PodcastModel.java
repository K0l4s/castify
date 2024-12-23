package com.castify.backend.models.podcast;

import com.castify.backend.models.genre.GenreSimple;
import com.castify.backend.models.user.UserSimple;
import com.fasterxml.jackson.annotation.JsonFormat;
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
    private List<GenreSimple> genres;
    private long views;
    private long duration;
    private long totalLikes;
    private long totalComments;
    private String username;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime createdDay;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime lastEdited;
    private boolean isActive;

    private boolean isLiked;
//    private List<CommentEntity> comments;
//    private List<PodcastLikeEntity> likes;

    private UserSimple user;
}
