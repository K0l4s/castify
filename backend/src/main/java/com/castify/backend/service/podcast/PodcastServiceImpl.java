package com.castify.backend.service.podcast;

import com.castify.backend.entity.PodcastEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.models.podcast.CreatePodcastModel;
import com.castify.backend.models.podcast.PodcastModel;
import com.castify.backend.repository.PodcastRepository;
import com.castify.backend.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class PodcastServiceImpl implements IPodcastService {
    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PodcastRepository podcastRepository;

    @Override
    public PodcastModel createPodcast(CreatePodcastModel createPodcastModel, String videoPath) {
        PodcastEntity podcastEntity = modelMapper.map(createPodcastModel, PodcastEntity.class);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        UserEntity userEntity = userRepository.findByEmailOrUsername(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));

        podcastEntity.setTitle(createPodcastModel.getTitle());
        podcastEntity.setContent(createPodcastModel.getContent());
        podcastEntity.setVideoUrl(videoPath);

        podcastEntity.setUser(userEntity);
        podcastEntity.setCreatedDay(LocalDateTime.now());
        podcastEntity.setLastEdited(LocalDateTime.now());
        podcastEntity.setActive(true);

        podcastRepository.save(podcastEntity);

        return modelMapper.map(podcastEntity, PodcastModel.class);
    }

    @Override
    public Map<String, Object> getAllSelfPodcasts(
            int page,
            int size,
            Integer minViews,
            Integer minComments,
            String sortByViews,
            String sortByComments,
            String sortByCreatedDay
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        UserEntity userEntity = userRepository.findByEmailOrUsername(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));

        // Xử lý giá trị mặc định cho minViews và minComments
        int minViewsValue = (minViews != null) ? minViews : 0;
        int minCommentsValue = (minComments != null) ? minComments : 0;

        // Tạo Pageable
        Sort sort = Sort.by(Sort.Direction.DESC, "createdDay");
        if ("desc".equalsIgnoreCase(sortByViews)) {
            sort = Sort.by(Sort.Direction.DESC, "views");
        } else if ("desc".equalsIgnoreCase(sortByComments)) {
            sort = Sort.by(Sort.Direction.DESC, "comments");
        } else if ("asc".equalsIgnoreCase(sortByCreatedDay)) {
            sort = Sort.by(Sort.Direction.ASC, "createdDay");
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<PodcastEntity> podcastEntities = podcastRepository.findByFilters(
                userEntity.getId(),
                minViewsValue,
                pageable
        );

        // Xử lý thêm logic filter minComments và ánh xạ sang PodcastModel
        // Ánh xạ trực tiếp và lọc theo minComments
        List<PodcastModel> podcastModels = podcastEntities.stream()
                .filter(podcast -> podcast.getTotalComments() >= minCommentsValue)
                .map(podcast -> {
                    PodcastModel podcastModel = modelMapper.map(podcast, PodcastModel.class);
                    podcastModel.setTotalLikes(podcast.getTotalLikes()); // Thiết lập các trường bổ sung
                    podcastModel.setTotalComments(podcast.getTotalComments());
                    podcastModel.setUsername(podcast.getUser().getUsername());
//                    podcastModel.setVideoUrl("/api/v1/podcast/video?path=" + podcast.getVideoUrl());
                    return podcastModel;
                })
                .toList();

        // Tính toán currentPage và totalPage
        int currentPage = podcastEntities.getNumber();
        int totalPages = podcastEntities.getTotalPages();

        // Thêm thông tin phân trang vào response
        Map<String, Object> response = new HashMap<>();
        response.put("currentPage", currentPage);
        response.put("totalPages", totalPages);
        response.put("podcasts", podcastModels);

        return response;
    }
}
