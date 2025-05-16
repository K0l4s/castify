package com.castify.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "playlist")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PlaylistEntity {
    @Id
    private String id;

    private String name;
    private String description;
    private boolean publish; // true: public, false: private
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;

    @DBRef
    private UserEntity owner;

    private List<PlaylistItem> items;
}
