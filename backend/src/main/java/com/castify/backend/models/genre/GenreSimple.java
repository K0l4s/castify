package com.castify.backend.models.genre;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GenreSimple {
    private String id;
    private String name;
    private String imageUrl;
    private String color;
    private String textColor;

    public GenreSimple(String id, String name, String imageUrl, String color) {
        this.id = id;
        this.name = name;
        this.imageUrl = imageUrl;
        this.color = color;
        this.textColor = "#ffffff"; // Default text color
    }

    public GenreSimple(String id, String name) {
        this.id = id;
        this.name = name;
    }
}
