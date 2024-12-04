package com.castify.backend.models.podcast;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class EditPodcastDTO {
    private String title;
    private String content;
    private String thumbnailPath;
    private List<String> genresId;
}
