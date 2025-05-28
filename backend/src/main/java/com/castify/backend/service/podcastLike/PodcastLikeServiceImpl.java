package com.castify.backend.service.podcastLike;

import com.castify.backend.entity.PodcastLikeEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.models.PageDTO;
import com.castify.backend.models.podcast.PodcastModel;
import com.castify.backend.repository.PodcastLikeRepository;
import com.castify.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PodcastLikeServiceImpl implements IPodcastLikeService {
    private final PodcastLikeRepository podcastLikeRepository;
    private final ModelMapper modelMapper;

    @Override
    public PageDTO<PodcastModel> getLikedPodcastsByUser(int page, int size) {
        UserEntity currentUser = SecurityUtils.getCurrentUser();

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));

        // Tìm tất cả PodcastLike của user hiện tại
        Page<PodcastLikeEntity> likedPodcasts = podcastLikeRepository.findByUserEntityIdOrderByTimestampDesc(
                currentUser.getId(), pageable);

        // Convert entities to models
        List<PodcastModel> podcasts = likedPodcasts.getContent().stream()
                .map(PodcastLikeEntity::getPodcastEntity)
                .filter(Objects::nonNull) // Filter out null podcasts (in case podcast was deleted)
                .map(entity -> {
                    PodcastModel model = modelMapper.map(entity, PodcastModel.class);
                    model.setLiked(true);
                    return model;
                })
                .collect(Collectors.toList());

        return new PageDTO<>(
                podcasts,
                size,
                page,
                likedPodcasts.getTotalPages(),
                likedPodcasts.getTotalElements()
        );
    }
}
