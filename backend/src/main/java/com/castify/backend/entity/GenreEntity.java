package com.castify.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "genre")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class GenreEntity {
    @Id
    private String id;
    private String name;
    private String description;
    private boolean isActive;
    private LocalDateTime lastEdited;
}
