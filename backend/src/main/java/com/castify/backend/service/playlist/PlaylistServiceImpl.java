package com.castify.backend.service.playlist;

import com.castify.backend.entity.PlaylistEntity;
import com.castify.backend.entity.PodcastEntity;
import com.castify.backend.entity.UserEntity;
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
}
