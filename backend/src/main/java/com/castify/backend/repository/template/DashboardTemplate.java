package com.castify.backend.repository.template;

import com.castify.backend.controller.UserActivityController;
import com.castify.backend.entity.*;
import com.castify.backend.enums.ReportStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class DashboardTemplate {
    @Autowired
    private MongoTemplate mongoTemplate;

    public Map<String, Object> getDashboardStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> statistics = new HashMap<>();

        // Lọc theo khoảng thời gian
        Criteria dateCriteria = new Criteria();
        dateCriteria.andOperator(
                Criteria.where("createdDay").gte(startDate),
                Criteria.where("createdDay").lte(endDate)
        );

        // Đếm tổng số người dùng trong khoảng thời gian

        long totalUsers = mongoTemplate.count(new Query(dateCriteria), UserEntity.class);
        statistics.put("totalUsers", totalUsers);

        Query userQuery = new Query(dateCriteria).limit(10);
        // Lấy người dùng mới trong khoảng thời gian
        List<UserEntity> newUsers = mongoTemplate.find(userQuery, UserEntity.class);
        statistics.put("newUsers", newUsers);

        // Lấy podcast mới trong khoảng thời gian
        List<PodcastEntity> newPodcasts = mongoTemplate.find(userQuery, PodcastEntity.class);
        statistics.put("newPodcasts", newPodcasts);
        // Đếm tổng số podcast trong khoảng thời gian
        long totalPodcasts = mongoTemplate.count(new Query(dateCriteria), PodcastEntity.class);
        statistics.put("totalPodcasts", totalPodcasts);

        // Đếm tổng số comment trong khoảng thời gian
        Criteria commentDateCriteria = new Criteria();
        commentDateCriteria.andOperator(
                Criteria.where("timestamp").gte(startDate),
                Criteria.where("timestamp").lte(endDate)
        );
        Query commentQuery = new Query(commentDateCriteria);
        long totalComments = mongoTemplate.count(commentQuery, CommentEntity.class);
        statistics.put("totalComments", totalComments);

        Criteria trackingDateCriteria = new Criteria();
        trackingDateCriteria.andOperator(
                Criteria.where("accessTime").gte(startDate),
                Criteria.where("accessTime").lte(endDate)
        );
        Query trackingQuery = new Query(trackingDateCriteria);
        long totalAccess = mongoTemplate.count(trackingQuery, VisitorEntity.class);
        statistics.put("totalAccess", totalAccess);

        // Tổng số lượt thích trong khoảng thời gian
        long totalLikes = mongoTemplate.aggregate(
                        Aggregation.newAggregation(
                                Aggregation.match(dateCriteria),
                                Aggregation.project("likes"),
                                Aggregation.unwind("likes"),
                                Aggregation.group().count().as("totalLikes")
                        ),
                        PodcastEntity.class,
                        Map.class
                ).getMappedResults().stream()
                .mapToLong(result -> ((Number) result.get("totalLikes")).longValue()) // Chuyển đổi sang Long an toàn
                .sum();


        statistics.put("totalLikes", totalLikes);

        Criteria statusCriteria = Criteria.where("status").is(ReportStatus.PENDING);
        Query reportQuery = new Query(new Criteria().andOperator(dateCriteria, statusCriteria));
        long totalReportsAwait = mongoTemplate.count(reportQuery, ReportEntity.class);
        statistics.put("totalReportsAwait", totalReportsAwait);

        return statistics;
    }
}
