package com.castify.backend.service.playlist;

import com.castify.backend.entity.PlaylistEntity;
import com.castify.backend.entity.PlaylistItem;
import com.castify.backend.entity.PodcastEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.enums.PlaylistType;
import com.castify.backend.exception.PermissionDeniedException;
import com.castify.backend.exception.ResourceAlreadyExistsException;
import com.castify.backend.models.playlist.CreatePlaylistDTO;
import com.castify.backend.models.playlist.PlaylistModel;
import com.castify.backend.repository.PlaylistRepository;
import com.castify.backend.repository.PodcastRepository;
import com.castify.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlaylistServiceImpl implements IPlaylistService {
    private final PlaylistRepository playlistRepository;
    private final ModelMapper modelMapper;
    private final PodcastRepository podcastRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public void createDefaultWatchLaterPlaylist(UserEntity user) {
        PlaylistEntity watchLater = new PlaylistEntity();
        watchLater.setName("Watch Later");
        watchLater.setDescription("Your watch later playlist");
        watchLater.setOwner(user);
        watchLater.setCreatedAt(LocalDateTime.now());
        watchLater.setLastUpdated(LocalDateTime.now());
        watchLater.setPublish(false);
        watchLater.setType(PlaylistType.WATCH_LATER);
        watchLater.setItems(new ArrayList<>());

        playlistRepository.save(watchLater);
    }

    @Override
    public PlaylistModel getPlaylistById(String id) {
        UserEntity auth = null;
        try {
            auth = SecurityUtils.getCurrentUser();
        } catch (Exception e) {
            // skip
        }

        PlaylistEntity playlistEntity = playlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist not found"));

        // Nếu playlist là private và user chưa đăng nhập hoặc không phải là chủ sở hữu → cấm truy cập
        if (!playlistEntity.isPublish()) {
            if (auth == null || !playlistEntity.getOwner().getId().equals(auth.getId())) {
                throw new PermissionDeniedException("You do not have permission to view this playlist");
            }
        }

        List<PlaylistItem> allItems = playlistEntity.getItems();

        // Lọc các podcast đang active
        List<PlaylistItem> filteredItems = allItems.stream()
                .filter(item -> {
                    // Kiểm tra xem podcast còn active không
                    return podcastRepository.findByIdAndIsActiveTrue(item.getPodcastId()).isPresent();
                })
                .toList();


        PlaylistModel model = modelMapper.map(playlistEntity, PlaylistModel.class);
        model.setItems(filteredItems);
        model.setHiddenCount(allItems.size() - filteredItems.size());
        return model;
    }

    @Override
    public PlaylistModel createPlaylist(CreatePlaylistDTO dto) {
        UserEntity auth = SecurityUtils.getCurrentUser();
        List<PlaylistItem> items = new ArrayList<>();

        if (dto.getPodcastId() != null && !dto.getPodcastId().isEmpty()) {
            List<PodcastEntity> podcasts = podcastRepository.findAllById(dto.getPodcastId());

            for (int i = 0; i < podcasts.size(); i++) {
                PodcastEntity podcast = podcasts.get(i);
                PlaylistItem item = new PlaylistItem(
                        podcast.getId(),
                        podcast.getThumbnailUrl(),
                        podcast.getDuration(),
                        podcast.getTitle(),
                        podcast.getContent(),
                        podcast.getUser().getLastName() + " " + podcast.getUser().getMiddleName() + " " + podcast.getUser().getFirstName(),
                        i // thứ tự
                );
                items.add(item);
            }
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

        PlaylistModel model = modelMapper.map(playlist, PlaylistModel.class);

        // Lọc ra các items có podcast isActive = true
        List<PlaylistItem> activeItems = playlist.getItems().stream()
                .filter(item -> podcastRepository.findByIdAndIsActiveTrue(item.getPodcastId()).isPresent())
                .toList();

        model.setItems(activeItems);

        return model;
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
                podcast.getTitle(),
                podcast.getContent(),
                podcast.getUser().getLastName() + podcast.getUser().getMiddleName() + podcast.getUser().getFirstName(),
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
                .map(p -> {
                    PlaylistModel model = modelMapper.map(p, PlaylistModel.class);

                    // Lọc ra các item có podcast isActive = true
                    List<PlaylistItem> visibleItems = p.getItems().stream()
                            .filter(item -> podcastRepository.findByIdAndIsActiveTrue(item.getPodcastId()).isPresent())
                            .toList();
                    model.setItems(visibleItems);
                    model.setHiddenCount(p.getItems().size() - visibleItems.size());

                    return model;
                })
                .toList();
    }

    @Override
    public List<PlaylistModel> getUserPublicPlaylists(String username) {
        return playlistRepository.findAll().stream()
                .filter(p -> p.getOwner().getUsername().equals(username) && p.isPublish())
                .map(p -> {
                    PlaylistModel model = modelMapper.map(p, PlaylistModel.class);

                    List<PlaylistItem> visibleItems = p.getItems().stream()
                            .filter(item -> podcastRepository.findByIdAndIsActiveTrue(item.getPodcastId()).isPresent())
                            .toList();
                    model.setItems(visibleItems);
                    model.setHiddenCount(p.getItems().size() - visibleItems.size());

                    return model;
                })
                .toList();
    }

    @Override
    public PlaylistModel reorder(String playlistId, List<String> newOrderPodcastIds) {
        PlaylistEntity playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));

        List<PlaylistItem> originalItems = playlist.getItems();

        Map<String, PlaylistItem> itemMap = originalItems.stream()
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

        // Giữ lại các item không được reorder (thường là isActive = false)
        List<PlaylistItem> hiddenItems = originalItems.stream()
                .filter(item -> !newOrderPodcastIds.contains(item.getPodcastId()))
                .toList();

        List<PlaylistItem> finalItems = new ArrayList<>(reordered);
        finalItems.addAll(hiddenItems);

        playlist.setItems(finalItems);
        playlist.setLastUpdated(LocalDateTime.now());

        return modelMapper.map(playlistRepository.save(playlist), PlaylistModel.class);
    }

    @Override
    public Page<PlaylistModel> searchPlaylists(String keyword, Pageable pageable) {
        try {
            // Tạo query tìm kiếm theo name và description
            Criteria criteria = new Criteria().orOperator(
                    Criteria.where("name").regex(keyword, "i"),
                    Criteria.where("description").regex(keyword, "i")
            )
                    .and("publish").is(true) // Chỉ search public playlists
                    .and("items").exists(true).not().size(0);

            Query query = new Query(criteria);
            List<PlaylistEntity> playlistEntities = mongoTemplate.find(query, PlaylistEntity.class);

            // Filter và convert to models - loại bỏ playlist không có active items
            List<PlaylistModel> playlistModels = playlistEntities.stream()
                    .map(playlist -> {
                        // Filter active items trước
                        List<PlaylistItem> activeItems = playlist.getItems().stream()
                                .filter(item -> podcastRepository.findByIdAndIsActiveTrue(item.getPodcastId()).isPresent())
                                .collect(Collectors.toList());

                        // Chỉ trả về playlist nếu có ít nhất 1 active item
                        if (activeItems.isEmpty()) {
                            return null;
                        }

                        PlaylistModel model = modelMapper.map(playlist, PlaylistModel.class);
                        model.setItems(activeItems);
                        model.setHiddenCount(playlist.getItems().size() - activeItems.size());

                        return model;
                    })
                    .filter(model -> model != null) // Loại bỏ các playlist null (không có active items)
                    .collect(Collectors.toList());

            // Apply pagination manually sau khi filter
            int start = (int) pageable.getOffset();
            int end = Math.min(start + pageable.getPageSize(), playlistModels.size());

            List<PlaylistModel> pagedResults = start < playlistModels.size() ?
                    playlistModels.subList(start, end) : new ArrayList<>();

            return new PageImpl<>(pagedResults, pageable, playlistModels.size());

        } catch (Exception e) {
            log.error("Error searching playlists with keyword: {}", keyword, e);
            return Page.empty(pageable);
        }
    }
}
