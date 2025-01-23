package com.castify.backend.models.genre;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GenreUsageCount {
    private String id;
    private String name;
    private long count;
}
