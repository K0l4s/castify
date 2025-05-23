package com.castify.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "podcastLike")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class PodcastLikeEntity {
    @Id
    private String id;
    @DBRef
    private UserEntity userEntity;
//    private String podcastId;
    private LocalDateTime timestamp;

    @DBRef(lazy = true)
    private PodcastEntity podcastEntity;
}
