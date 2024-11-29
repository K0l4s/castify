package com.castify.backend.models.podcast;

import com.castify.backend.models.genre.GenreSimple;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CreatePodcastModel {
    private String title;
    private String content;
    private String videoPath;
    private String thumbnailPath;
    private List<String> genresId;
}
