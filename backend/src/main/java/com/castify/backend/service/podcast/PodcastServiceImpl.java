package com.castify.backend.service.podcast;

import com.castify.backend.entity.*;
import com.castify.backend.enums.ActivityType;
import com.castify.backend.enums.NotiType;
import com.castify.backend.models.PageDTO;
import com.castify.backend.models.genre.GenreSimple;
import com.castify.backend.models.podcast.CreatePodcastModel;
import com.castify.backend.models.podcast.EditPodcastDTO;
import com.castify.backend.models.podcast.PodcastModel;
import com.castify.backend.models.user.FollowInfo;
import com.castify.backend.models.user.UserSimple;
import com.castify.backend.models.userActivity.AddActivityRequestDTO;
import com.castify.backend.repository.*;
import com.castify.backend.service.notification.INotificationService;
import com.castify.backend.service.uploadFile.UploadFileServiceImpl;
import com.castify.backend.service.user.IUserService;
import com.castify.backend.service.userActivity.UserActivityServiceImpl;
import com.castify.backend.utils.SecurityUtils;
import org.bson.types.ObjectId;
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
    private CommentLikeRepository commentLikeRepository;

    @Autowired
    private UserActivityRepository userActivityRepository;

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
    @Autowired
    private INotificationService notificationService;
    @Autowired
    private IVideoTranscribe videoTranscribe;
    @Override
    public PodcastModel createPodcast(CreatePodcastModel createPodcastModel, String userId) {
        PodcastEntity podcastEntity = modelMapper.map(createPodcastModel, PodcastEntity.class);

        UserEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userId));

        List<GenreEntity> validGenres = genreRepository.findAllById(createPodcastModel.getGenresId());

        podcastEntity.setId(null);
        podcastEntity.setTitle(createPodcastModel.getTitle());
        podcastEntity.setContent(createPodcastModel.getContent());
        podcastEntity.setVideoUrl(createPodcastModel.getVideoPath());
        podcastEntity.setThumbnailUrl(createPodcastModel.getThumbnailPath());
        podcastEntity.setDuration(createPodcastModel.getDuration());

        podcastEntity.setGenres(validGenres);
        podcastEntity.setUser(userEntity);
        podcastEntity.setCreatedDay(LocalDateTime.now());
        podcastEntity.setLastEdited(LocalDateTime.now());
        podcastEntity.setActive(true);

        PodcastEntity savedPodcast = podcastRepository.save(podcastEntity);
//        videoTranscribe.transcribeVideo(podcast.)
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

        PodcastEntity podcastEntity;

        // Kiểm tra quyền sở hữu podcast
        Optional<PodcastEntity> optionalPodcast = podcastRepository.findById(podcastId);
        if (optionalPodcast.isPresent()) {
            PodcastEntity tempPodcast = optionalPodcast.get();
            boolean isOwner = tempPodcast.getUser().getId().equals(userEntity.getId());

            // Nếu là chủ sở hữu, cho phép xem kể cả khi không active
            if (isOwner) {
                podcastEntity = tempPodcast;
            } else if (tempPodcast.isActive()) {
                // Nếu không phải chủ sở hữu, chỉ cho phép xem podcast đang active
                podcastEntity = tempPodcast;
            } else {
                throw new RuntimeException("Podcast not found or inactive");
            }
        } else {
            throw new RuntimeException("Podcast not found");
        }
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
        long followerSize = userRepository.findUsersFollowers(podcastUser.getId()).size();
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
    public PodcastModel getPodcastBySelf(String podcastId) throws Exception {
        UserEntity userEntity = userService.getUserByAuthentication();

        PodcastEntity podcastEntity = podcastRepository.findById(podcastId)
                .orElseThrow(() -> new RuntimeException("Podcast not found"));

        // Kiểm tra quyền sở hữu
        if (!podcastEntity.getUser().getId().equals(userEntity.getId())) {
            throw new RuntimeException("Access denied");
        }

        // Tính tổng số bình luận và lượt thích
        long totalComments = commentRepository.countByPodcastId(podcastId);
        long totalLikes = podcastLikeRepository.countByPodcastEntityId(podcastId);

        // Ánh xạ PodcastEntity sang PodcastModel
        PodcastModel podcastModel = modelMapper.map(podcastEntity, PodcastModel.class);
        podcastModel.setTotalComments(totalComments);
        podcastModel.setTotalLikes(totalLikes);
        podcastModel.setUsername(podcastEntity.getUser().getUsername());

        // Kiểm tra xem người dùng hiện tại có thích podcast này không
        boolean isLiked = podcastLikeRepository.existsByUserEntityIdAndPodcastEntityId(userEntity.getId(), podcastId);
        podcastModel.setLiked(isLiked);

        // Ánh xạ thông tin user của podcast
        UserEntity podcastUser = podcastEntity.getUser();
        UserSimple userSimple = modelMapper.map(podcastUser, UserSimple.class);

        // Tính tổng follower
        long followerSize = userRepository.findUsersFollowers(podcastUser.getId()).size();
        userSimple.setTotalFollower(followerSize);

        // Tính tổng số người đang theo dõi
        long followingCount = podcastUser.getFollowing().size();
        userSimple.setTotalFollowing(followingCount);

        // Kiểm tra người dùng hiện tại có theo dõi user của podcast không
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
        PodcastEntity podcastEntity = podcastRepository.findByIdAndIsActiveTrue(id)
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
        long followerSize = userRepository.findUsersFollowers(podcastUser.getId()).size();
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
            PodcastLikeEntity likeToRemove = existingLike.get();
            podcastLikeRepository.delete(likeToRemove);

            // Gỡ bỏ tham chiếu ngược
            podcastEntity.getLikes().remove(likeToRemove);
        } else {
            // Nếu chưa like, thì thêm like
            PodcastLikeEntity newLike = new PodcastLikeEntity();
            newLike.setUserEntity(userEntity);
            newLike.setPodcastEntity(podcastEntity);
            newLike.setTimestamp(LocalDateTime.now());
            podcastLikeRepository.save(newLike);
            notificationService.saveNotification(
                    podcastEntity.getUser().getId(),
                    NotiType.LIKE,
                    "Bạn vừa nhận thêm 1 lượt thích!",
                    "Bạn vừa nhận thêm 1 lượt thích ở video "+podcastEntity.getTitle()+"!",
                    "/watch?pid=" + podcastEntity.getId()
            );
            // Thêm tham chiếu ngược
            if (podcastEntity.getLikes() == null) {
                podcastEntity.setLikes(new ArrayList<>());
            }
            podcastEntity.getLikes().add(newLike);
        }

        podcastRepository.save(podcastEntity);
        return "Success";
    }

    @Override
    public PageDTO<PodcastModel> getRecentPodcasts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdDay")
                .and(Sort.by(Sort.Direction.DESC, "views")));
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
    public PageDTO<PodcastModel> getPopularPodcasts(int page, int size) {
        // Tạo Pageable với sort theo views giảm dần
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "views")
                .and(Sort.by(Sort.Direction.ASC, "createdDay")));
        // Truy vấn podcast hoạt động và sắp xếp
        Page<PodcastEntity> podcastPage = podcastRepository.findByIsActiveTrue(pageable);

        // Chuyển đổi dữ liệu từ PodcastEntity sang PodcastModel
        List<PodcastModel> podcastModels = podcastPage.getContent()
                .stream()
                .map(podcastEntity -> modelMapper.map(podcastEntity, PodcastModel.class))
                .toList();

        // Trả về PageDTO chứa thông tin paginated
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
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "views")
                .and(Sort.by(Sort.Direction.ASC, "createdDay")));

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
    public PageDTO<PodcastModel> getSuggestedPodcastsByGenres(List<String> genreIds, String currentPodcastId, int page, int size) {
        if (genreIds == null || genreIds.isEmpty()) {
            throw new IllegalArgumentException("Genre IDs must not be null or empty.");
        }

        // Query các podcast có ít nhất một genre trùng với id trong genreIds
        Criteria criteria = Criteria.where("genres._id").in(genreIds).and("_id").ne(currentPodcastId);
        Query baseQuery = new Query(criteria);

        // Đếm tổng số podcast
        long totalElements = mongoTemplate.count(baseQuery, PodcastEntity.class);

        // Áp dụng phân trang cho truy vấn
        Query pagedQuery = baseQuery.with(PageRequest.of(page, size));
        List<PodcastEntity> podcastEntities = mongoTemplate.find(pagedQuery, PodcastEntity.class);

        List<PodcastModel> podcastModels = podcastEntities.stream()
                .map(podcast -> modelMapper.map(podcast, PodcastModel.class))
                .toList();

        int totalPages = (int) Math.ceil((double) totalElements / size);

        // Trả về đối tượng PageDTO
        return new PageDTO<>(podcastModels, page, totalPages, (int) totalElements);
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
                    .and(Sort.by(Sort.Direction.DESC, "createdDay"));
            ;
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
    public PageDTO<PodcastModel> getPodcastsFromFollowing(int page, int size) throws Exception {
        UserEntity currentUser = userService.getUserByAuthentication();

        // Lấy danh sách ID của following
        List<String> followingIds = currentUser.getFollowing()
                .stream()
                .map(FollowInfo::getUserId) // Lấy trường `id` từ từng `FollowingInfo`
                .toList();

        if (followingIds.isEmpty()) {
            return new PageDTO<>(List.of(), page, 0, 0);
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdDay")
                .and(Sort.by(Sort.Direction.DESC, "views")));

        List<ObjectId> followingObjectIds = followingIds.stream()
                .map(ObjectId::new)
                .collect(Collectors.toList());

        // Lấy danh sách podcast theo danh sách ID
        Page<PodcastEntity> podcastPage = podcastRepository.findByUserIdInAndIsActiveTrue(followingObjectIds, pageable);
        // Chuyển đổi dữ liệu từ PodcastEntity sang PodcastModel
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
    public PageDTO<PodcastModel> searchPodcast(int page, int size, String keyword) throws Exception {

        Sort sort = sort = Sort.by(Sort.Direction.DESC, "createdDay");

        // Tạo Pageable với sắp xếp
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<PodcastEntity> podcastEntities = podcastRepository.searchPodcastByFields(keyword, pageable);

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

    @Override
    public void deletePodcastsByIds(List<String> podcastIds, boolean isAdmin) throws Exception {
        List<PodcastEntity> podcasts = podcastRepository.findAllById(podcastIds);
        if (podcasts.isEmpty() || podcasts.size() != podcastIds.size()) {
            throw new RuntimeException("One or more podcasts not found.");
        }

        // Lấy người dùng hiện tại
        UserEntity currentUser = userService.getUserByAuthentication();

        for (PodcastEntity podcast : podcasts) {
            // Nếu không phải admin, kiểm tra quyền sở hữu podcast
            if (!isAdmin && !podcast.getUser().getId().equals(currentUser.getId())) {
                throw new RuntimeException("You do not have permission to delete this podcast.");
            }

            // Xóa các comment liên quan đến podcast
            List<CommentEntity> comments = commentRepository.findByPodcastId(podcast.getId());

            if (comments != null && !comments.isEmpty()) {
                for (CommentEntity comment : comments) {
                    // Xóa comment likes liên quan
                    if (comment.getLikes() != null && !comment.getLikes().isEmpty()) {
                        commentLikeRepository.deleteAll(comment.getLikes());
                    }

                    // Xóa các reply liên quan
                    if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
                        commentRepository.deleteAll(comment.getReplies());
                    }
                }
                commentRepository.deleteAll(comments);
            }

            // Xóa các like của podcast
            if (podcast.getLikes() != null && !podcast.getLikes().isEmpty()) {
                podcastLikeRepository.deleteAll(podcast.getLikes());
            }

            // Xóa các comment khỏi PodcastEntity để tránh orphan records
            if (podcast.getComments() != null) {
                podcast.getComments().clear(); // Xóa tất cả các comments liên kết với podcast
            }

            // Xóa các hoạt động liên quan đến podcast
            List<UserActivityEntity> activities = userActivityRepository.findByPodcast(podcast);
            if (activities != null && !activities.isEmpty()) {
                userActivityRepository.deleteAll(activities);
            }

            podcastRepository.delete(podcast);
        }
    }

    @Override
    public PageDTO<PodcastModel> getTrendingPodcasts(int page, int size) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime last24Hours = now.minusHours(24);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Order.desc("views")));

        Page<PodcastEntity> podcastPage = podcastRepository.findAllByIsActiveTrue(pageable);

        List<Map.Entry<PodcastEntity, Double>> scored = podcastPage.getContent().stream().map(podcast -> {
                    long views = podcast.getViews();
                    long likes24h = podcast.getLikes() == null ? 0 :
                            podcast.getLikes().stream()
                                    .filter(like -> like.getTimestamp().isAfter(last24Hours))
                                    .count();

                    long comments24h = podcast.getComments() == null ? 0 :
                            podcast.getComments().stream()
                                    .filter(comment -> comment.getTimestamp().isAfter(last24Hours))
                                    .count();

                    double score = views * 1.0 + likes24h * 2.0 + comments24h * 3.0;

                    return new AbstractMap.SimpleEntry<>(podcast, score);
                }).sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .collect(Collectors.toList());

        List<PodcastModel> models = scored.stream()
                .map(entry -> mapToModel(entry.getKey()))
                .collect(Collectors.toList());

        return new PageDTO<>(
                models,
                size,
                page,
                podcastPage.getTotalPages(),
                (int) podcastPage.getTotalElements()
        );
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

    private PodcastModel mapToModel(PodcastEntity podcast) {
        UserSimple userSimple = modelMapper.map(podcast.getUser(), UserSimple.class);
        boolean isLiked = false;

        if (SecurityUtils.isAuthenticated()) {
            UserEntity auth = SecurityUtils.getCurrentUser();
            isLiked = podcastLikeRepository.existsByUserEntityIdAndPodcastEntityId(auth.getId(), podcast.getId());
        }

        return new PodcastModel(
                podcast.getId(),
                podcast.getTitle(),
                podcast.getContent(),
                podcast.getThumbnailUrl(),
                podcast.getVideoUrl(),
                podcast.getGenres() != null ? podcast.getGenres().stream()
                        .map(g -> new GenreSimple(g.getId(), g.getName()))
                        .collect(Collectors.toList()) : new ArrayList<>(),
                podcast.getViews(),
                podcast.getDuration(),
                podcast.getTotalLikes(),
                podcast.getTotalComments(),
                podcast.getUser() != null ? podcast.getUser().getUsername() : null,
                podcast.getCreatedDay(),
                podcast.getLastEdited(),
                podcast.isActive(),
                isLiked,
                podcast.getUser() != null ? userSimple : null
        );
    }
}
