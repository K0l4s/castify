package com.castify.backend.repository.template;

import com.castify.backend.entity.CommentEntity;
import com.castify.backend.entity.PodcastEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
public class NotificationTemplate {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private UserRepository userRepository;

    /**
     * Lấy thông báo chưa đọc
     */
    public List<String> getUnreadNotifications(String userId) {
        UserEntity user = mongoTemplate.findById(userId, UserEntity.class);
        List<String> notifications = new ArrayList<>();

        // Lấy tất cả thông báo mới nhất
        List<String> allNotifications = getAllNotifications(userId);

        for (String notification : allNotifications) {
            if (!user.getReadNotifications().contains(notification)) {
                notifications.add(notification);
            }
        }

        return notifications;
    }

    /**
     * Đánh dấu thông báo đã đọc
     */
    public void markNotificationAsRead(String userId, String notificationId) {
        Query query = new Query(Criteria.where("id").is(userId));
        Update update = new Update().addToSet("readNotifications", notificationId);
        mongoTemplate.updateFirst(query, update, UserEntity.class);
    }

    /**
     * Lấy tất cả thông báo (gồm cả đã đọc và chưa đọc)
     */
    public List<String> getAllNotifications(String userId) {
        List<String> notifications = new ArrayList<>();
        notifications.addAll(getNewPodcastNotifications(userId));
        notifications.addAll(getNewCommentNotifications(userId));
        return notifications;
    }
    public List<String> getNewPodcastNotifications(String userId) {
        List<String> notifications = new ArrayList<>();

        Query query = new Query();
        query.addCriteria(Criteria.where("user.id").is(userId));  // Lọc podcast của user
        query.addCriteria(Criteria.where("createdDay").gte(LocalDateTime.now().minusDays(1)));  // Lấy trong 24h qua

        List<PodcastEntity> podcasts = mongoTemplate.find(query, PodcastEntity.class);

        for (PodcastEntity podcast : podcasts) {
            notifications.add("Podcast mới: " + podcast.getTitle() + " đã được đăng thành công!");
        }
        return notifications;
    }
    public List<String> getNewCommentNotifications(String userId) {
        List<String> notifications = new ArrayList<>();

        // Lấy tất cả podcast của user
        Query podcastQuery = new Query();
        podcastQuery.addCriteria(Criteria.where("user.id").is(userId));

        List<PodcastEntity> podcasts = mongoTemplate.find(podcastQuery, PodcastEntity.class);

        // Lấy tất cả comment mới vào podcast trong 24h qua
        Query commentQuery = new Query();
        commentQuery.addCriteria(Criteria.where("podcast").in(podcasts));
        commentQuery.addCriteria(Criteria.where("timestamp").gte(LocalDateTime.now().minusDays(1)));

        List<CommentEntity> comments = mongoTemplate.find(commentQuery, CommentEntity.class);

        for (CommentEntity comment : comments) {
            String message = "Có người bình luận mới vào podcast: " + comment.getPodcast().getTitle() +
                    " - Nội dung: " + comment.getContent();
            notifications.add(message);
        }
        return notifications;
    }
    // Các phương thức khác (getNewPodcastNotifications, getNewCommentNotifications)
}
