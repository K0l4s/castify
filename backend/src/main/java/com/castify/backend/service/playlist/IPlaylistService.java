package com.castify.backend.service.playlist;

import com.castify.backend.models.playlist.CreatePlaylistDTO;
import com.castify.backend.models.playlist.PlaylistModel;

public interface IPlaylistService {
    PlaylistModel createPlaylist(CreatePlaylistDTO createPlaylistDTO);
}
