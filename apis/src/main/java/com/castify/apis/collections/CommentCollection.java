package com.castify.apis.collections;

import jakarta.persistence.Id;
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
public class CommentCollection {
    @Id
    private String id;

    @DBRef
    private User user;

    private String content;

    @DBRef
    private List<CommentLikeCollection> likes;

    @DBRef
    private List<CommentCollection> replies;

    private LocalDateTime timestamp;

    public long getTotalLikes(){
        return likes.size();
    }

    public long getTotalReplies(){
        return replies.size();
    }
}
