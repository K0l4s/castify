package com.castify.backend.entity;

import org.springframework.data.annotation.Id; // Sửa dòng này
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "podcast")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class PodcastEntity {
    @Id
    private String id;
    private String title;
    private String content;
    private String audioUrl;
    private String thumbnailUrl;
    private String videoUrl;
    private long views;
    @DBRef
    private List<CommentEntity> comments;

    @DBRef
    private List<PodcastLikeEntity> likes;

    private LocalDateTime createdDay;

    private LocalDateTime lastEdited;

    private boolean isActive;

    @DBRef
    private UserEntity user;

    public long getTotalLikes(){
        return likes.size();
    }

    public long getTotalComments(){
        return comments.size();
    }
}
