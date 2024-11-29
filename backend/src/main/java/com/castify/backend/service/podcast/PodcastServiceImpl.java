package com.castify.backend.service.podcast;

import com.castify.backend.entity.*;
import com.castify.backend.models.PageDTO;
import com.castify.backend.models.comment.CommentModel;
import com.castify.backend.models.podcast.CreatePodcastModel;
import com.castify.backend.models.podcast.PodcastModel;
import com.castify.backend.repository.*;
import com.castify.backend.service.user.IUserService;
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
import java.util.stream.Collectors;

@Service
public class PodcastServiceImpl implements IPodcastService {
    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PodcastRepository podcastRepository;

    @Autowired
    private PodcastLikeRepository podcastLikeRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private IUserService userService;

    @Autowired
    private GenreRepository genreRepository;

    @Override
    public PodcastModel createPodcast(CreatePodcastModel createPodcastModel) {
        PodcastEntity podcastEntity = modelMapper.map(createPodcastModel, PodcastEntity.class);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        UserEntity userEntity = userRepository.findByEmailOrUsername(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));

        List<GenreEntity> validGenres = genreRepository.findAllById(createPodcastModel.getGenresId());

        podcastEntity.setId(null);
        podcastEntity.setTitle(createPodcastModel.getTitle());
        podcastEntity.setContent(createPodcastModel.getContent());
        podcastEntity.setVideoUrl(createPodcastModel.getVideoPath());
        podcastEntity.setThumbnailUrl(createPodcastModel.getThumbnailPath());

        podcastEntity.setGenres(validGenres);
        podcastEntity.setUser(userEntity);
        podcastEntity.setCreatedDay(LocalDateTime.now());
        podcastEntity.setLastEdited(LocalDateTime.now());
        podcastEntity.setActive(true);

        podcastRepository.save(podcastEntity);

        return modelMapper.map(podcastEntity, PodcastModel.class);
    }

    @Override
    public PageDTO<PodcastModel> getAllSelfPodcasts(
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
                .map(podcast -> {
                    long totalComments = commentRepository.countByPodcastId(podcast.getId());
                    if (totalComments >= minCommentsValue) { // Lọc tại đây
                        PodcastModel podcastModel = modelMapper.map(podcast, PodcastModel.class);
                        podcastModel.setTotalComments(totalComments);
                        podcastModel.setTotalLikes(podcastLikeRepository.countByPodcastEntityId(podcast.getId()));
                        podcastModel.setUsername(podcast.getUser().getUsername());
//                    podcastModel.setVideoUrl("/api/v1/podcast/video?path=" + podcast.getVideoUrl());
                        return podcastModel;
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .toList();

        PageDTO<PodcastModel> pageDTO = new PageDTO<>();
        pageDTO.setContent(podcastModels);
        pageDTO.setCurrentPage(podcastEntities.getNumber());
        pageDTO.setTotalPages(podcastEntities.getTotalPages());
        pageDTO.setTotalElements((int) podcastEntities.getTotalElements());

        return pageDTO;
    }

    @Override
    public PodcastModel getPodcastById(String podcastId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        UserEntity userEntity = userRepository.findByEmailOrUsername(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));

        PodcastEntity podcastEntity = podcastRepository.findById(podcastId)
                .orElseThrow(() -> new RuntimeException("Podcast not found"));

        long totalComments = commentRepository.countByPodcastId(podcastId);
        long totalLikes = podcastLikeRepository.countByPodcastEntityId(podcastId);

        PodcastModel podcastModel = modelMapper.map(podcastEntity, PodcastModel.class);
        podcastModel.setTotalComments(totalComments);
        podcastModel.setTotalLikes(totalLikes);
        podcastModel.setUsername(podcastEntity.getUser().getUsername());

        boolean isLiked = podcastLikeRepository.existsByUserEntityIdAndPodcastEntityId(userEntity.getId(), podcastId);
        podcastModel.setLiked(isLiked);

        return podcastModel;
    }

    @Override
    public PodcastModel getPodcastByIdAnonymous(String id) {
        PodcastEntity podcastEntity = podcastRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Podcast not found"));

        long totalComments = commentRepository.countByPodcastId(id);
        long totalLikes = podcastLikeRepository.countByPodcastEntityId(id);

        PodcastModel podcastModel = modelMapper.map(podcastEntity, PodcastModel.class);
        podcastModel.setTotalComments(totalComments);
        podcastModel.setTotalLikes(totalLikes);
        podcastModel.setUsername(podcastEntity.getUser().getUsername());

        podcastModel.setLiked(false);

        return podcastModel;
    }

    @Override
    public String toggleLikeOnPodcast(String id) throws Exception {
        System.out.println(id);
        UserEntity userEntity = userService.getUserByAuthentication();

        PodcastEntity podcastEntity = podcastRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Podcast not found"));

        Optional<PodcastLikeEntity> existingLike = podcastLikeRepository
                .findByUserEntityIdAndPodcastEntityId(userEntity.getId(), podcastEntity.getId());

        if (existingLike.isPresent()) {
            // Nếu đã like, thì unlike
            podcastLikeRepository.delete(existingLike.get());
        } else {
            // Nếu chưa like, thì thêm like
            PodcastLikeEntity newLike = new PodcastLikeEntity();
            newLike.setUserEntity(userEntity);
            newLike.setPodcastEntity(podcastEntity);
            newLike.setTimestamp(LocalDateTime.now());
            podcastLikeRepository.save(newLike);
        }
        return "Success";
    }

    @Override
    public PageDTO<PodcastModel> getRecentPodcasts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdDay"));
        Page<PodcastEntity> podcastPage = podcastRepository.findByIsActiveTrue(pageable);

        List<PodcastModel> podcastModels = podcastPage.getContent()
                .stream()
                .map(podcastEntity -> modelMapper.map(podcastEntity, PodcastModel.class))
                .toList();

        return new PageDTO<>(
                podcastModels,
                podcastPage.getSize(),
                podcastPage.getNumber(),
                podcastPage.getTotalPages(),
                podcastPage.getTotalElements()
        );
    }

    @Override
    public PageDTO<PodcastModel> getPodcastsByGenre(String genreId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdDay"));

        // Tìm các podcast theo genreId
        Page<PodcastEntity> podcastPage = podcastRepository.findByGenres_IdAndIsActiveTrue(genreId, pageable);

        // Ánh xạ từ PodcastEntity sang PodcastModel
        List<PodcastModel> podcastModels = podcastPage.getContent()
                .stream()
                .map(podcastEntity -> modelMapper.map(podcastEntity, PodcastModel.class))
                .toList();

        // Tạo PageDTO
        return new PageDTO<>(
                podcastModels,
                podcastPage.getSize(),
                podcastPage.getNumber(),
                podcastPage.getTotalPages(),
                podcastPage.getTotalElements()
        );
    }
}
