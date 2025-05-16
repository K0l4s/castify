package com.castify.backend.models.playlist;

import lombok.Data;

import java.util.List;

@Data
public class ReorderPlaylistDTO {
    private String playlistId;
    private List<String> podcastIds;
}
