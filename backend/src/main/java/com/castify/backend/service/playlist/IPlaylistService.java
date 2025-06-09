package com.castify.backend.service.playlist;

import com.castify.backend.models.playlist.CreatePlaylistDTO;
import com.castify.backend.models.playlist.PlaylistModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IPlaylistService {
    PlaylistModel getPlaylistById(String id);
    PlaylistModel createPlaylist(CreatePlaylistDTO createPlaylistDTO);
    PlaylistModel updatePlaylist(String id, String name, String description, boolean publish);
    void deletePlaylist(String id);
    PlaylistModel addPodcastToPlaylist(String playlistId, String podcastId);
    PlaylistModel removePodcastFromPlaylist(String playlistId, String podcastId);
    List<PlaylistModel> getCurrentUserPlaylists(String sortBy, String order);
    List<PlaylistModel> getUserPublicPlaylists(String username);
    PlaylistModel reorder(String playlistId, List<String> newOrderPodcastIds);
    Page<PlaylistModel> searchPlaylists(String keyword, Pageable pageable);
}
