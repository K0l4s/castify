package com.castify.backend.controller;

import com.castify.backend.models.playlist.CreatePlaylistDTO;
import com.castify.backend.models.playlist.PlaylistModel;
import com.castify.backend.models.playlist.ReorderPlaylistDTO;
import com.castify.backend.service.playlist.IPlaylistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/playlist")
@RequiredArgsConstructor
public class PlaylistController {
    private final IPlaylistService playlistService;

    @GetMapping("/{id}")
    public ResponseEntity<PlaylistModel> getPlaylistById(@PathVariable String id) {
        return ResponseEntity.ok(playlistService.getPlaylistById(id));
    }

    @PostMapping
    public ResponseEntity<PlaylistModel> createPlaylist(@Valid @RequestBody CreatePlaylistDTO dto) {
        return ResponseEntity.ok(playlistService.createPlaylist(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlaylistModel> updatePlaylist(@PathVariable String id,
                                                        @RequestParam String name,
                                                        @RequestParam String description,
                                                        @RequestParam boolean publish) {
        return ResponseEntity.ok(playlistService.updatePlaylist(id, name, description, publish));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlaylist(@PathVariable String id) {
        playlistService.deletePlaylist(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/add")
    public ResponseEntity<PlaylistModel> addPodcast(@PathVariable String id,
                                                    @RequestParam String podcastId) {
        return ResponseEntity.ok(playlistService.addPodcastToPlaylist(id, podcastId));
    }

    @DeleteMapping("/{id}/remove")
    public ResponseEntity<PlaylistModel> removePodcast(@PathVariable String id,
                                                       @RequestParam String podcastId) {
        return ResponseEntity.ok(playlistService.removePodcastFromPlaylist(id, podcastId));
    }

    @GetMapping("/user")
    public ResponseEntity<List<PlaylistModel>> getUserPlaylists(
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String order,
            Sort sort) {
        return ResponseEntity.ok(playlistService.getCurrentUserPlaylists(sortBy, order));
    }

    @GetMapping("/public/{username}")
    public ResponseEntity<List<PlaylistModel>> getUserPublicPlaylists(@PathVariable String username) {
        return ResponseEntity.ok(playlistService.getUserPublicPlaylists(username));
    }

    @PostMapping("/reorder")
    public ResponseEntity<PlaylistModel> reorder(@RequestBody ReorderPlaylistDTO dto) {
        PlaylistModel updated = playlistService.reorder(dto.getPlaylistId(), dto.getPodcastIds());
        return ResponseEntity.ok(updated);
    }


}
