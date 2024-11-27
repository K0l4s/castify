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
    private String thumbnailUrl;
    private String videoUrl;
    private long views;

    @DBRef(lazy = true)
    private List<GenreEntity> genres;

    @DBRef(lazy = true)
    private List<CommentEntity> comments;

    @DBRef(lazy = true)
    private List<PodcastLikeEntity> likes;

    private LocalDateTime createdDay;

    private LocalDateTime lastEdited;

    private boolean isActive;

    @DBRef(lazy = true)
    private UserEntity user;

    public long getTotalLikes() {
        return likes != null ? likes.size() : 0;
    }

    public long getTotalComments() {
        return comments != null ? comments.size() : 0;
    }
}
