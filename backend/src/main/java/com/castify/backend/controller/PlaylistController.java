package com.castify.backend.controller;

import com.castify.backend.models.playlist.CreatePlaylistDTO;
import com.castify.backend.models.playlist.PlaylistModel;
import com.castify.backend.service.playlist.IPlaylistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/playlist")
@RequiredArgsConstructor
public class PlaylistController {
    private final IPlaylistService playlistService;

    @PostMapping
    public ResponseEntity<PlaylistModel> createPlaylist(@Valid @RequestBody CreatePlaylistDTO dto) {
        return ResponseEntity.ok(playlistService.createPlaylist(dto));
    }
}
