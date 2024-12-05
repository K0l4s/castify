package com.castify.backend.service.podcast;

import com.castify.backend.entity.*;
import com.castify.backend.enums.ActivityType;
import com.castify.backend.models.PageDTO;
import com.castify.backend.models.comment.CommentModel;
import com.castify.backend.models.podcast.CreatePodcastModel;
import com.castify.backend.models.podcast.EditPodcastDTO;
import com.castify.backend.models.podcast.PodcastModel;
import com.castify.backend.models.user.UserSimple;
import com.castify.backend.models.userActivity.AddActivityRequestDTO;
import com.castify.backend.repository.*;
import com.castify.backend.service.uploadFile.UploadFileServiceImpl;
import com.castify.backend.service.user.IUserService;
import com.castify.backend.service.userActivity.UserActivityServiceImpl;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
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

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private UserActivityServiceImpl userActivityService;

    @Autowired
    private UploadFileServiceImpl uploadFileService;

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
    public PodcastModel getPodcastById(String podcastId) throws Exception {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        UserEntity userEntity = userRepository.findByEmailOrUsername(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));

        PodcastEntity podcastEntity = podcastRepository.findById(podcastId)
                .orElseThrow(() -> new RuntimeException("Podcast not found"));

        // Tạo activity khi user xem podcast
        AddActivityRequestDTO activityDTO = new AddActivityRequestDTO();
        activityDTO.setType(ActivityType.VIEW_PODCAST);
        activityDTO.setPodcastId(podcastId);
        userActivityService.addActivity(activityDTO);

        long totalComments = commentRepository.countByPodcastId(podcastId);
        long totalLikes = podcastLikeRepository.countByPodcastEntityId(podcastId);

        PodcastModel podcastModel = modelMapper.map(podcastEntity, PodcastModel.class);
        podcastModel.setTotalComments(totalComments);
        podcastModel.setTotalLikes(totalLikes);
        podcastModel.setUsername(podcastEntity.getUser().getUsername());

        boolean isLiked = podcastLikeRepository.existsByUserEntityIdAndPodcastEntityId(userEntity.getId(), podcastId);
        podcastModel.setLiked(isLiked);

        // Ánh xạ UserSimple
        UserEntity podcastUser = podcastEntity.getUser();
        UserSimple userSimple = modelMapper.map(podcastUser, UserSimple.class);

        // Tính tổng follower
        long followerSize = userRepository.findUsersFollowing(podcastUser.getId()).size();
        userSimple.setTotalFollower(followerSize);

        // Tính tổng following
        long followingCount = podcastUser.getFollowing().size();
        userSimple.setTotalFollowing(followingCount);

        // Kiểm tra người dùng hiện tại có follow người này không
        try {
            if (userEntity.getFollowing() == null) {
                userEntity.setFollowing(new ArrayList<>());
            }
            userSimple.setIsFollow(userEntity.isFollow(podcastUser.getId()));
        } catch (Exception ex) {
            userSimple.setIsFollow(false);
        }

        podcastModel.setUser(userSimple);

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

        // Ánh xạ UserSimple
        UserEntity podcastUser = podcastEntity.getUser();
        UserSimple userSimple = modelMapper.map(podcastUser, UserSimple.class);

        // Tính tổng follower
        long followerSize = userRepository.findUsersFollowing(podcastUser.getId()).size();
        System.out.println("followerSize " + followerSize);
        userSimple.setTotalFollower(followerSize);

        podcastModel.setUser(userSimple);

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

    @Override
    public void incrementPodcastViews(String podcastId) {
        Query query = new Query(Criteria.where("_id").is(podcastId));
        Update update = new Update().inc("views", 1);
        mongoTemplate.updateFirst(query, update, PodcastEntity.class);
    }

    @Override
    public PageDTO<PodcastModel> getUserPodcasts(String username, int page, int size, String sortBy) throws Exception {
        UserEntity user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Sort sort;
        if ("oldest".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "createdDay");
        } else if ("views".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "views")
                    .and(Sort.by(Sort.Direction.DESC, "createdDay"));;
        } else {
            // Default là newest
            sort = Sort.by(Sort.Direction.DESC, "createdDay");
        }

        // Tạo Pageable với sắp xếp
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<PodcastEntity> podcastEntities = podcastRepository.findAllByUserIdAndIsActiveTrue(user.getId(), pageable);

        return convertPodcastEntitiesToPageDTO(podcastEntities);
    }

    @Override
    public void togglePodcastDisplayMode(List<String> podcastIds) throws Exception {
        UserEntity user = userService.getUserByAuthentication();
        List<PodcastEntity> podcasts = podcastRepository.findAllById(podcastIds);

        if (podcasts.isEmpty() || podcasts.size() != podcastIds.size()) {
            throw new RuntimeException("One or more podcasts not found.");
        }

        for (PodcastEntity podcast : podcasts) {
            podcast.setActive(!podcast.isActive());
        }

        podcastRepository.saveAll(podcasts);
    }

    @Override
    public PodcastModel updatePodcast(String podcastId, EditPodcastDTO editPodcastDTO) {
        PodcastEntity podcast = podcastRepository.findById(podcastId)
                .orElseThrow(() -> new RuntimeException("Podcast not found"));

        if (editPodcastDTO.getTitle() != null) {
            podcast.setTitle(editPodcastDTO.getTitle());
        }

        if (editPodcastDTO.getContent() != null) {
            podcast.setContent(editPodcastDTO.getContent());
        }

        if (editPodcastDTO.getThumbnailPath() != null) {
            podcast.setThumbnailUrl(editPodcastDTO.getThumbnailPath());
        }

        if (editPodcastDTO.getGenresId() != null) {
            List<GenreEntity> genres = genreRepository.findAllById(editPodcastDTO.getGenresId());
            podcast.setGenres(genres);
        }

        podcast.setLastEdited(LocalDateTime.now());

        podcastRepository.save(podcast);

        return modelMapper.map(podcast, PodcastModel.class);
    }

    private PageDTO<PodcastModel> convertPodcastEntitiesToPageDTO(Page<PodcastEntity> podcastEntities) {
        List<PodcastModel> podcastModels = podcastEntities.getContent().stream()
                .map(podcast -> {
                    PodcastModel podcastModel = modelMapper.map(podcast, PodcastModel.class);
                    podcastModel.setTotalComments(commentRepository.countByPodcastId(podcast.getId()));
                    podcastModel.setTotalLikes(podcastLikeRepository.countByPodcastEntityId(podcast.getId()));
                    podcastModel.setUsername(podcast.getUser().getUsername());
                    return podcastModel;
                })
                .toList();

        PageDTO<PodcastModel> pageDTO = new PageDTO<>();
        pageDTO.setContent(podcastModels);
        pageDTO.setCurrentPage(podcastEntities.getNumber());
        pageDTO.setTotalPages(podcastEntities.getTotalPages());
        pageDTO.setTotalElements((int) podcastEntities.getTotalElements());

        return pageDTO;
    }
}
