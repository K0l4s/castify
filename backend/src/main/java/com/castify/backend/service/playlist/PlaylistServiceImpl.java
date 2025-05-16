package com.castify.backend.service.playlist;

import com.castify.backend.entity.PlaylistEntity;
import com.castify.backend.entity.PodcastEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.exception.PermissionDeniedException;
import com.castify.backend.exception.ResourceAlreadyExistsException;
import com.castify.backend.models.playlist.CreatePlaylistDTO;
import com.castify.backend.models.playlist.PlaylistModel;
import com.castify.backend.repository.PlaylistRepository;
import com.castify.backend.repository.PodcastRepository;
import com.castify.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlaylistServiceImpl implements IPlaylistService {
    private final PlaylistRepository playlistRepository;
    private final ModelMapper modelMapper;
    private final PodcastRepository podcastRepository;

    @Override
    public PlaylistModel createPlaylist(CreatePlaylistDTO createPlaylistDTO) {
        UserEntity auth = SecurityUtils.getCurrentUser();

        List<PodcastEntity> podcasts = podcastRepository.findAllById(createPlaylistDTO.getPodcastId());

        PlaylistEntity playlistEntity = new PlaylistEntity();
        playlistEntity.setName(createPlaylistDTO.getName());
        playlistEntity.setDescription(createPlaylistDTO.getDescription());
        playlistEntity.setPodcasts(podcasts);
        playlistEntity.setOwner(auth);
        playlistEntity.setCreatedAt(LocalDateTime.now());
        playlistEntity.setLastUpdated(LocalDateTime.now());
        playlistEntity.setPublish(createPlaylistDTO.isPublish());

        // Save
        playlistRepository.save(playlistEntity);

        return modelMapper.map(playlistEntity, PlaylistModel.class);
    }

    @Override
    public PlaylistModel updatePlaylist(String id, String name, String description, boolean publish) {
        UserEntity auth = SecurityUtils.getCurrentUser();
        PlaylistEntity playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));

        if (!playlist.getOwner().getId().equals(auth.getId())) {
            throw new PermissionDeniedException("You do not have permission to access this resource");
        }

        if (!name.equals(playlist.getName())) {
            playlist.setName(name);
        }

        if (!description.equals(playlist.getDescription())) {
            playlist.setDescription(description);
        }

        playlist.setPublish(publish);
        playlist.setLastUpdated(LocalDateTime.now());
        playlist = playlistRepository.save(playlist);
        return modelMapper.map(playlist, PlaylistModel.class);
    }

    @Override
    public void deletePlaylist(String id) {
        UserEntity auth = SecurityUtils.getCurrentUser();

        PlaylistEntity playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));

        if (!playlist.getOwner().getId().equals(auth.getId())) {
            throw new PermissionDeniedException("You do not have permission to delete this playlist");
        }

        playlistRepository.deleteById(id);
    }

    @Override
    public PlaylistModel addPodcastToPlaylist(String playlistId, String podcastId) {
        PlaylistEntity playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));
        PodcastEntity podcast = podcastRepository.findById(podcastId)
                .orElseThrow(() -> new RuntimeException("Podcast not found"));

        if (playlist.getPodcasts().contains(podcast)) {
            throw new ResourceAlreadyExistsException("Podcast already exists");
        }
        else {
            playlist.getPodcasts().add(podcast);
        }

        playlist.setLastUpdated(LocalDateTime.now());

        return modelMapper.map(playlistRepository.save(playlist), PlaylistModel.class);
    }

    @Override
    public PlaylistModel removePodcastFromPlaylist(String playlistId, String podcastId) {
        UserEntity auth = SecurityUtils.getCurrentUser();

        PlaylistEntity playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));

        if (!playlist.getOwner().getId().equals(auth.getId())) {
            throw new PermissionDeniedException("You do not have permission to delete this playlist");
        }

        playlist.getPodcasts().removeIf(p-> p.getId().equals(podcastId));
        playlist.setLastUpdated(LocalDateTime.now());

        return modelMapper.map(playlistRepository.save(playlist), PlaylistModel.class);
    }

    @Override
    public List<PlaylistModel> getCurrentUserPlaylists() {
        UserEntity auth = SecurityUtils.getCurrentUser();

        return playlistRepository.findAll().stream()
                .filter(p -> p.getOwner().getId().equals(auth.getId()))
                .map(p -> modelMapper.map(p, PlaylistModel.class))
                .toList();
    }

    @Override
    public List<PlaylistModel> getUserPublicPlaylists(String userId) {
        return playlistRepository.findAll().stream()
                .filter(p -> p.getOwner().getId().equals(userId) && p.isPublish())
                .map(p -> modelMapper.map(p, PlaylistModel.class))
                .toList();
    }
}
