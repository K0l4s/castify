package com.castify.backend.service.dashboard;

import com.castify.backend.entity.PodcastEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.models.dashboard.OverviewModel;
import com.castify.backend.models.user.BasicUserModel;
import com.castify.backend.repository.PodcastRepository;
import com.castify.backend.repository.UserRepository;
import com.castify.backend.repository.template.DashboardTemplate;
import com.castify.backend.service.user.IUserService;
import com.castify.backend.service.user.UserServiceImpl;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements IDashboardService{
    @Autowired
    private DashboardTemplate dashboardTemplate;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private IUserService userService = new UserServiceImpl();
    @Autowired
    private PodcastRepository podcastRepository;

    @Autowired
    private UserRepository userRepository;
    @Override
    public OverviewModel getOverviewInformation(LocalDateTime start, LocalDateTime end){
        Map<String,Object> overviewTempl = dashboardTemplate.getDashboardStatistics(start,end);

        OverviewModel overviewModel = modelMapper.map(overviewTempl,OverviewModel.class);

        List<UserEntity> userSimilars = (List<UserEntity>) overviewTempl.get("newUsers");
        List<BasicUserModel> newUsers = userSimilars.stream()
                .map(user -> userService.mapToBasicUser(user)).collect(Collectors.toList());

        overviewModel.setNewUsers(newUsers);
        return overviewModel;
    }

    @Override
    public Map<String, Object> getCreatorDashboard() throws Exception {
        // Lấy thông tin user
        UserEntity currentUser = userService.getUserByAuthentication();

        // Tổng số follower
        long totalFollowers = userRepository.findUsersFollowers(currentUser.getId()).size();

        // Lấy tất cả video của creator
        List<PodcastEntity> videos = podcastRepository.findByUserId(currentUser.getId());

        // Tổng số like
        long totalLikes = videos.stream().mapToLong(PodcastEntity::getTotalLikes).sum();

        // Tổng số comment
        long totalComments = videos.stream().mapToLong(PodcastEntity::getTotalComments).sum();

        // Top 10 video nổi bật
        List<Map<String, Object>> topVideos = videos.stream()
                .sorted((a, b) -> Long.compare(
                        b.getTotalLikes() + b.getTotalComments() + b.getViews(),
                        a.getTotalLikes() + a.getTotalComments() + a.getViews()))
                .limit(10)
                .map(video -> {
                    Map<String, Object> videoMap = new HashMap<>();
                    videoMap.put("id", video.getId());
                    videoMap.put("title", video.getTitle());
                    videoMap.put("likes", video.getTotalLikes());
                    videoMap.put("comments", video.getTotalComments());
                    videoMap.put("views", video.getViews());
                    videoMap.put("thumbnailUrl", video.getThumbnailUrl());
                    return videoMap;
                })
                .collect(Collectors.toList());


        // Kết quả trả về
        Map<String, Object> result = new HashMap<>();
        result.put("totalFollowers", totalFollowers);
        result.put("totalLikes", totalLikes);
        result.put("totalComments", totalComments);
        result.put("topVideos", topVideos);

        return result;
    }
    @Override
    public Map<String, Object> getCreatorDashboard(LocalDateTime start, LocalDateTime end) throws Exception {
        // Lấy thông tin user
        UserEntity currentUser = userService.getUserByAuthentication();

        // Tổng số follower
        long totalFollowers = userRepository.findUsersFollowersBetween(currentUser.getId(),start,end).size();

        // Lấy tất cả video của creator
        List<PodcastEntity> videos = podcastRepository.findByUserIdAndCreatedDayBetween(currentUser.getId(),start,end);

        // Tổng số like
        long totalLikes = videos.stream().mapToLong(PodcastEntity::getTotalLikes).sum();

        // Tổng số comment
        long totalComments = videos.stream().mapToLong(PodcastEntity::getTotalComments).sum();

        long totalViews =  videos.stream().mapToLong(PodcastEntity::getViews).sum();


        // Top 10 video nổi bật
        List<Map<String, Object>> topVideos = videos.stream()
                .sorted((a, b) -> Long.compare(
                        b.getTotalLikes() + b.getTotalComments() + b.getViews(),
                        a.getTotalLikes() + a.getTotalComments() + a.getViews()))
                .limit(10)
                .map(video -> {
                    Map<String, Object> videoMap = new HashMap<>();
                    videoMap.put("id", video.getId());
                    videoMap.put("title", video.getTitle());
                    videoMap.put("likes", video.getTotalLikes());
                    videoMap.put("comments", video.getTotalComments());
                    videoMap.put("views", video.getViews());
                    videoMap.put("thumbnailUrl", video.getThumbnailUrl());
                    return videoMap;
                })
                .collect(Collectors.toList());


        // Kết quả trả về
        Map<String, Object> result = new HashMap<>();
        result.put("totalFollowers", totalFollowers);
        result.put("totalLikes", totalLikes);
        result.put("totalComments", totalComments);
        result.put("topVideos", topVideos);
        result.put("totalViews",totalViews);

        return result;
    }
    @Override
    public Map<String, Object> getPodcastStaticsGraphDataByDate(LocalDateTime start, LocalDateTime end) throws Exception {
//        if (ChronoUnit.DAYS.between(start.toLocalDate(), end.toLocalDate()) > 366) {
//            throw new IllegalArgumentException("Chỉ cho phép xem thống kê trong tối đa 366 ngày.");
//        }

        UserEntity currentUser = userService.getUserByAuthentication();
        List<PodcastEntity> videos = podcastRepository.findByUserIdAndCreatedDayBetween(currentUser.getId(), start, end);

        // Duyệt qua từng ngày và khởi tạo các map
        Map<LocalDate, Long> dailyViews = new TreeMap<>();
        Map<LocalDate, Long> dailyLikes = new TreeMap<>();
        Map<LocalDate, Long> dailyComments = new TreeMap<>();

        // Khởi tạo giá trị 0 cho mỗi ngày trong khoảng
        LocalDate datePointer = start.toLocalDate();
        LocalDate endDate = end.toLocalDate();
        while (!datePointer.isAfter(endDate)) {
            dailyViews.put(datePointer, 0L);
            dailyLikes.put(datePointer, 0L);
            dailyComments.put(datePointer, 0L);
            datePointer = datePointer.plusDays(1);
        }

        // Tính toán số liệu từng ngày
        for (PodcastEntity video : videos) {
            LocalDate createdDate = video.getCreatedDay().toLocalDate();
            dailyViews.put(createdDate, dailyViews.getOrDefault(createdDate, 0L) + video.getViews());
            dailyLikes.put(createdDate, dailyLikes.getOrDefault(createdDate, 0L) + video.getTotalLikes());
            dailyComments.put(createdDate, dailyComments.getOrDefault(createdDate, 0L) + video.getTotalComments());
        }

        // Chuẩn bị dữ liệu trả về cho biểu đồ
        List<String> labels = new ArrayList<>();
        List<Long> viewsData = new ArrayList<>();
        List<Long> likesData = new ArrayList<>();
        List<Long> commentsData = new ArrayList<>();

        for (LocalDate date : dailyViews.keySet()) {
            labels.add(date.toString());
            viewsData.add(dailyViews.get(date));
            likesData.add(dailyLikes.get(date));
            commentsData.add(dailyComments.get(date));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("labels", labels); // list các ngày
        result.put("views", viewsData);
        result.put("likes", likesData);
        result.put("comments", commentsData);

        return result;
    }

}
