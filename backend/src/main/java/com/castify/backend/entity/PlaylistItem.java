package com.castify.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PlaylistItem {
    private String podcastId;
    private String thumbnail;
    private long duration;
    private int order;
}
