package com.castify.backend.service.playlist;

import com.castify.backend.models.playlist.CreatePlaylistDTO;
import com.castify.backend.models.playlist.PlaylistModel;

import java.util.List;

public interface IPlaylistService {
    PlaylistModel createPlaylist(CreatePlaylistDTO createPlaylistDTO);
    PlaylistModel updatePlaylist(String id, String name, String description, boolean publish);
    void deletePlaylist(String id);
    PlaylistModel addPodcastToPlaylist(String playlistId, String podcastId);
    PlaylistModel removePodcastFromPlaylist(String playlistId, String podcastId);
    List<PlaylistModel> getCurrentUserPlaylists(String sortBy, String order);
    List<PlaylistModel> getUserPublicPlaylists(String userId);
    PlaylistModel reorder(String playlistId, List<String> newOrderPodcastIds);
}
