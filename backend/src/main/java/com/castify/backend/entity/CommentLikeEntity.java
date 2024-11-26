package com.castify.backend.entity;

import org.springframework.data.annotation.Id; // Sửa dòng này
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "commentLike")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class CommentLikeEntity {
    @Id
    private String id;

    @DBRef
    private UserEntity userEntity;

    private LocalDateTime timestamp;

    @DBRef(lazy = true)
    private CommentEntity commentEntity;
}
