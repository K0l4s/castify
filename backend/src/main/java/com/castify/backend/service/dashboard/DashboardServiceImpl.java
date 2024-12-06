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

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
        UserEntity creator = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Creator not found"));

        // Tổng số follower
        long totalFollowers = creator.getFollowing().size();

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
}
