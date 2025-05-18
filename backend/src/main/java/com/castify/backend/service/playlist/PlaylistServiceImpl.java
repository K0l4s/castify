package com.castify.backend.service.playlist;

import com.castify.backend.entity.PlaylistEntity;
import com.castify.backend.entity.PlaylistItem;
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
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlaylistServiceImpl implements IPlaylistService {
    private final PlaylistRepository playlistRepository;
    private final ModelMapper modelMapper;
    private final PodcastRepository podcastRepository;

    @Override
    public PlaylistModel createPlaylist(CreatePlaylistDTO dto) {
        UserEntity auth = SecurityUtils.getCurrentUser();

        List<PodcastEntity> podcasts = podcastRepository.findAllById(dto.getPodcastId());

        List<PlaylistItem> items = new ArrayList<>();
        for (int i = 0; i < podcasts.size(); i++) {
            PodcastEntity podcast = podcasts.get(i);
            PlaylistItem item = new PlaylistItem(
                    podcast.getId(),
                    podcast.getThumbnailUrl(),
                    podcast.getDuration(),
                    i // thứ tự
            );
            items.add(item);
        }

        PlaylistEntity playlistEntity = new PlaylistEntity();
        playlistEntity.setName(dto.getName());
        playlistEntity.setDescription(dto.getDescription());
        playlistEntity.setItems(items);
        playlistEntity.setOwner(auth);
        playlistEntity.setCreatedAt(LocalDateTime.now());
        playlistEntity.setLastUpdated(LocalDateTime.now());
        playlistEntity.setPublish(dto.isPublish());

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

        if (playlist.getItems().stream().anyMatch(i -> i.getPodcastId().equals(podcastId))) {
            throw new ResourceAlreadyExistsException("Podcast already exists in the playlist");
        }

        PlaylistItem item = new PlaylistItem(
                podcast.getId(),
                podcast.getThumbnailUrl(),
                podcast.getDuration(),
                playlist.getItems().size() // thêm cuối danh sách
        );

        playlist.getItems().add(item);
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

        playlist.getItems().removeIf(i -> i.getPodcastId().equals(podcastId));

        // cập nhật lại thứ tự phát sau khi xoá
        for (int i = 0; i < playlist.getItems().size(); i++) {
            playlist.getItems().get(i).setOrder(i);
        }

        playlist.setLastUpdated(LocalDateTime.now());

        return modelMapper.map(playlistRepository.save(playlist), PlaylistModel.class);
    }

    @Override
    public List<PlaylistModel> getCurrentUserPlaylists(String sortBy, String order) {
        UserEntity auth = SecurityUtils.getCurrentUser();

        Comparator<PlaylistEntity> comparator;

        switch (sortBy) {
            case "createdAt":
                comparator = Comparator.comparing(PlaylistEntity::getCreatedAt);
                break;
            case "updatedAt":
            default:
                comparator = Comparator.comparing(PlaylistEntity::getLastUpdated);
                break;
        }

        if ("desc".equalsIgnoreCase(order)) {
            comparator = comparator.reversed();
        }

        return playlistRepository.findAll().stream()
                .filter(p -> p.getOwner().getId().equals(auth.getId()))
                .sorted(comparator)
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

    @Override
    public PlaylistModel reorder(String playlistId, List<String> newOrderPodcastIds) {
        PlaylistEntity playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));

        Map<String, PlaylistItem> itemMap = playlist.getItems().stream()
                .collect(Collectors.toMap(PlaylistItem::getPodcastId, i -> i));

        List<PlaylistItem> reordered = new ArrayList<>();
        for (int i = 0; i < newOrderPodcastIds.size(); i++) {
            String id = newOrderPodcastIds.get(i);
            PlaylistItem item = itemMap.get(id);
            if (item != null) {
                item.setOrder(i);
                reordered.add(item);
            }
        }

        playlist.setItems(reordered);
        playlist.setLastUpdated(LocalDateTime.now());

        return modelMapper.map(playlistRepository.save(playlist), PlaylistModel.class);
    }
}
