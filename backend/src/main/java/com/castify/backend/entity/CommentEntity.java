package com.castify.backend.entity;

import org.springframework.data.annotation.Id; // Sửa dòng này
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection="comment")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class CommentEntity {
    @Id
    private String id;

    private String parentId;

    @DBRef(lazy = true)
    private UserEntity user;

    private String mentionedUser;

    private String content;

    @DBRef(lazy = true)
    private List<CommentLikeEntity> likes;

    @DBRef(lazy = true)
    private List<CommentEntity> replies;

    private LocalDateTime timestamp;

    private LocalDateTime lastModified;

    @DBRef(lazy = true)
    private PodcastEntity podcast;

    public long getTotalLikes(){
        return likes != null ? likes.size() : 0;
    }

    public long getTotalReplies(){
        return replies != null ? replies.size() : 0;
    }
}
