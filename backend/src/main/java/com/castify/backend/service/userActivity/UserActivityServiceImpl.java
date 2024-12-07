package com.castify.backend.service.userActivity;

import com.castify.backend.entity.CommentEntity;
import com.castify.backend.entity.PodcastEntity;
import com.castify.backend.entity.UserActivityEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.enums.ActivityType;
import com.castify.backend.models.PageDTO;
import com.castify.backend.models.podcast.PodcastModel;
import com.castify.backend.models.userActivity.AddActivityRequestDTO;
import com.castify.backend.models.userActivity.UserActivityGroupedByDate;
import com.castify.backend.models.userActivity.UserActivityModel;
import com.castify.backend.repository.CommentRepository;
import com.castify.backend.repository.PodcastRepository;
import com.castify.backend.repository.UserActivityRepository;
import com.castify.backend.service.user.UserServiceImpl;
import org.bson.Document;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserActivityServiceImpl implements IUserActivityService{
    @Autowired
    private UserServiceImpl userService;

    @Autowired
    private PodcastRepository podcastRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserActivityRepository userActivityRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public void addActivity(AddActivityRequestDTO requestDTO) throws Exception {
        UserEntity user = userService.getUserByAuthentication();

        PodcastEntity podcastEntity = null;
        if (requestDTO.getPodcastId() != null) {
            podcastEntity = podcastRepository.findById(requestDTO.getPodcastId())
                    .orElseThrow(() -> new RuntimeException("Podcast not found"));
        }

        CommentEntity commentEntity = null;
        if (requestDTO.getCommentId() != null) {
            commentEntity = commentRepository.findById(requestDTO.getCommentId())
                    .orElseThrow(() -> new RuntimeException("Comment not found"));
        }

        // Kiểm tra nếu hoạt động đã tồn tại
        UserActivityEntity existingActivity = userActivityRepository.findByUserAndTypeAndPodcast(
                user, requestDTO.getType(), podcastEntity);

        if (existingActivity != null) {
            // Nếu đã tồn tại, cập nhật timestamp
            existingActivity.setTimestamp(LocalDateTime.now());
            userActivityRepository.save(existingActivity);
        } else {
            // Nếu chưa tồn tại, tạo mới
            UserActivityEntity activity = new UserActivityEntity();
            activity.setUser(user);
            activity.setType(requestDTO.getType());
            activity.setPodcast(podcastEntity);
            activity.setComment(commentEntity);
            activity.setTimestamp(LocalDateTime.now());
            userActivityRepository.save(activity);
        }
    }

    @Override
    public PageDTO<UserActivityModel> getViewPodcastActivitiesByDate(int page) throws Exception {
        UserEntity user = userService.getUserByAuthentication();

        // Lấy toàn bộ các hoạt động VIEW_PODCAST của user, sắp xếp giảm dần theo timestamp
        List<UserActivityEntity> activities = userActivityRepository.findAllByUserIdAndType(
                user.getId(),
                ActivityType.VIEW_PODCAST,
                Sort.by(Sort.Direction.DESC, "timestamp")
        );

        // Lọc danh sách để chỉ giữ lại các hoạt động liên quan đến podcast active
        List<UserActivityEntity> activeActivities = activities.stream()
                .filter(activity -> activity.getPodcast() != null && activity.getPodcast().isActive())
                .toList();

        return getActivitiesGroupedByDate(activeActivities, page);
    }

    @Override
    public void removeViewPodcastActivity(String actId) {
        UserActivityEntity userActivity = userActivityRepository.findByIdAndType(actId, ActivityType.VIEW_PODCAST);
        if (userActivity == null) return;

        userActivityRepository.delete(userActivity);
    }

    @Override
    public void removeAllViewPodcastActivities() throws Exception {
        UserEntity user = userService.getUserByAuthentication();
        // Lấy danh sách các activity của user có type VIEW_PODCAST
        List<UserActivityEntity> activities = userActivityRepository.findAllByUserIdAndType(user.getId(), ActivityType.VIEW_PODCAST);

        if (activities.isEmpty()) {
            return;
        }

        userActivityRepository.deleteAll(activities);
    }

    @Override
    public List<UserActivityGroupedByDate> searchActivitiesByPodcastTitleAndGroupByDate(String title) throws Exception {
        UserEntity user = userService.getUserByAuthentication();
        List<UserActivityEntity> activities = userActivityRepository.findAllByUserIdAndType(user.getId(), ActivityType.VIEW_PODCAST);

        // Lọc dữ liệu ở Java
        List<UserActivityEntity> filteredActivities = activities.stream()
                .filter(activity -> activity.getPodcast() != null &&
                        activity.getPodcast().getTitle().toLowerCase().contains(title.toLowerCase()))
                .toList();

        // Gom nhóm và format lại
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, List<UserActivityModel>> groupedByDate = filteredActivities.stream()
                .map(activity -> modelMapper.map(activity, UserActivityModel.class))
                .collect(Collectors.groupingBy(activity -> activity.getTimestamp().format(formatter)));

        // Sắp xếp theo ngày giảm dần và sắp xếp `activities` theo timestamp giảm dần
        return groupedByDate.entrySet().stream()
                .sorted((e1, e2) -> e2.getKey().compareTo(e1.getKey())) // Sắp xếp ngày giảm dần
                .map(entry -> {
                    // Sắp xếp `activities` trong từng nhóm giảm dần theo timestamp
                    List<UserActivityModel> sortedActivities = entry.getValue().stream()
                            .sorted((a1, a2) -> a2.getTimestamp().compareTo(a1.getTimestamp()))
                            .collect(Collectors.toList());
                    return new UserActivityGroupedByDate(entry.getKey(), sortedActivities);
                })
                .collect(Collectors.toList());
    }

    private PageDTO<UserActivityModel> getActivitiesGroupedByDate(
            List<UserActivityEntity> activities, int page) {
        if (activities.isEmpty()) {
            return new PageDTO<>(Collections.emptyList(), 0, page, 0, 0);
        }

        // Nhóm theo ngày
        Map<LocalDate, List<UserActivityEntity>> groupedByDate = activities.stream()
                .collect(Collectors.groupingBy(activity -> activity.getTimestamp().toLocalDate()));

        // Sắp xếp danh sách các ngày giảm dần
        List<LocalDate> dates = new ArrayList<>(groupedByDate.keySet());
        dates.sort(Comparator.reverseOrder());

        // Kiểm tra nếu page vượt quá phạm vi
        if (page >= dates.size()) {
            throw new RuntimeException("Page out of range");
        }

        // Lấy ngày hiện tại
        LocalDate selectedDate = dates.get(page);
        List<UserActivityEntity> activitiesForSelectedDate = groupedByDate.get(selectedDate);

        // Chuyển đổi sang UserActivityModel
        List<UserActivityModel> activityModels = activitiesForSelectedDate.stream()
                .map(entity -> {
                    UserActivityModel model = new UserActivityModel();
                    model.setId(entity.getId());
                    model.setType(entity.getType());

                    // Mapping PodcastEntity sang PodcastModel
                    if (entity.getPodcast() != null) {
                        PodcastModel podcastModel = modelMapper.map(entity.getPodcast(), PodcastModel.class);
                        model.setPodcast(podcastModel);
                    }

                    model.setTimestamp(entity.getTimestamp());
                    return model;
                })
                .toList();

        // Tạo PageDTO
        return new PageDTO<>(activityModels, activitiesForSelectedDate.size(), page, dates.size(), activities.size());
    }
}
