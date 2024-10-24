package com.castify.apis.collections;

import jakarta.persistence.Id;
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
public class PodcastCollection {
    @Id
    private String id;
    private String title;
    private String content;
    private String audioUrl;
    private String thumbnailUrl;
    private String videoUrl;
    private long views;
    @DBRef
    private List<CommentCollection> comments;

    @DBRef
    private List<PodcastLikeCollection> likes;

    private LocalDateTime createdDay;

    private LocalDateTime lastEdited;

    private boolean isActive;

    @DBRef
    private UserCollection user;

    public long getTotalLikes(){
        return likes.size();
    }

    public long getTotalComments(){
        return comments.size();
    }
}
