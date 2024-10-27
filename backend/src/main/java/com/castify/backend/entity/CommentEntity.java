package com.castify.backend.entity;

import org.springframework.data.annotation.Id; // Sửa dòng này
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.catalina.User;
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

    @DBRef
    private User user;

    private String content;

    @DBRef
    private List<CommentLikeEntity> likes;

    @DBRef
    private List<CommentEntity> replies;

    private LocalDateTime timestamp;

    public long getTotalLikes(){
        return likes.size();
    }

    public long getTotalReplies(){
        return replies.size();
    }
}
