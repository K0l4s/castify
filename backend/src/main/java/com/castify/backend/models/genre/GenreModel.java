package com.castify.backend.models.genre;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GenreModel {
    private String id;
    private String name;
    private String imageUrl;
    private boolean isActive;
    private LocalDateTime lastEdited;
}
