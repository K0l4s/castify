package com.castify.apis.collections;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "podcastLike")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class PodcastLikeCollection {
    @Id
    private String id;
    @DBRef
    private UserCollection userCollection;
    private LocalDateTime timestamp;
}
