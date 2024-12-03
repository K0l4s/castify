package com.castify.backend.entity;

import com.castify.backend.enums.ActivityType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "userActivity")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserActivityEntity {
    @Id
    private String id;

    @DBRef(lazy = true)
    private UserEntity user;

    private ActivityType type;

    @DBRef(lazy = true)
    private PodcastEntity podcast;

    @DBRef(lazy = true)
    private CommentEntity comment;

    private LocalDateTime timestamp;
}
