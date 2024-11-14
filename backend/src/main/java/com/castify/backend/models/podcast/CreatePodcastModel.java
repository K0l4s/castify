package com.castify.backend.models.podcast;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CreatePodcastModel {
    private String title;
    private String content;
    private String thumbnailUrl;
    private String videoUrl;
}
