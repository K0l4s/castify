package com.castify.backend.service.podcast;

import com.castify.backend.entity.PodcastEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.models.PageDTO;
import com.castify.backend.models.genre.GenreSimple;
import com.castify.backend.models.podcast.PodcastModel;
import com.castify.backend.models.user.UserSimple;
import com.castify.backend.repository.PodcastLikeRepository;
import com.castify.backend.repository.PodcastRepository;
import com.castify.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class TrendingPodcastService {
    private final PodcastRepository podcastRepository;
    private final PodcastLikeRepository podcastLikeRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ModelMapper modelMapper;

    private static final String TRENDING_CACHE_KEY = "trending_podcasts";
    private static final String TRENDING_LOCK_KEY = "trending_podcasts_lock";
    private static final int TRENDING_LIMIT = 100;

    public PageDTO<PodcastModel> getTrendingPodcasts(int page, int size) {
        // Kiểm tra cache trước
        List<PodcastModel> cachedTrending = getCachedTrendingPodcasts();

        if (cachedTrending == null || cachedTrending.isEmpty()) {
            log.info("Cache miss - calculating trending podcasts");
            cachedTrending = calculateAndCacheTrendingPodcasts();
        }

        // Phân trang từ cache
        return paginateResults(cachedTrending, page, size);
    }

    @SuppressWarnings("unchecked")
    private List<PodcastModel> getCachedTrendingPodcasts() {
        try {
            Object cached = redisTemplate.opsForValue().get(TRENDING_CACHE_KEY);
            return cached != null ? (List<PodcastModel>) cached : null;
        } catch (Exception e) {
            log.error("Error getting cached trending podcasts: {}", e.getMessage());
            // Xóa cache bị lỗi
            try {
                redisTemplate.delete(TRENDING_CACHE_KEY);
            } catch (Exception deleteError) {
                log.error("Error deleting corrupted cache", deleteError);
            }
            return null;
        }
    }

    private List<PodcastModel> calculateAndCacheTrendingPodcasts() {
        // Lấy 100 podcast có tương tác gần đây nhất
        List<PodcastEntity> recentPodcasts = getRecentInteractivePodcasts();

        // Tính score và sắp xếp
        List<PodcastModel> trendingPodcasts = calculateTrendingScores(recentPodcasts);

        // Cache kết quả
        cacheTrendingPodcasts(trendingPodcasts);

        return trendingPodcasts;
    }

    private List<PodcastEntity> getRecentInteractivePodcasts() {
        LocalDateTime last7Days = LocalDateTime.now().minusDays(7);

        // Đơn giản hơn: lấy podcast theo views và created date
        Pageable pageable = PageRequest.of(0, TRENDING_LIMIT,
                Sort.by(Sort.Direction.DESC, "views", "createdDay"));

        Page<PodcastEntity> podcasts = podcastRepository.findAllByIsActiveTrue(pageable);

        // Filter podcasts có tương tác gần đây
        return podcasts.getContent().stream()
                .filter(podcast -> hasRecentInteraction(podcast, last7Days))
                .collect(Collectors.toList());
    }

    private boolean hasRecentInteraction(PodcastEntity podcast, LocalDateTime since) {
        // Check likes gần đây
        boolean hasRecentLikes = podcast.getLikes() != null &&
                podcast.getLikes().stream()
                        .anyMatch(like -> like.getTimestamp().isAfter(since));

        // Check comments gần đây
        boolean hasRecentComments = podcast.getComments() != null &&
                podcast.getComments().stream()
                        .anyMatch(comment -> comment.getTimestamp().isAfter(since));

        // Hoặc podcast được tạo gần đây
        boolean isRecentlyCreated = podcast.getCreatedDay().isAfter(since);

        return hasRecentLikes || hasRecentComments || isRecentlyCreated;
    }

    private List<PodcastModel> calculateTrendingScores(List<PodcastEntity> podcasts) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime last24Hours = now.minusHours(24);
        LocalDateTime last7Days = now.minusDays(7);

        return podcasts.stream()
                .map(podcast -> {
                    // Tính các metrics
                    long views = podcast.getViews();

                    long likes24h = podcast.getLikes() == null ? 0 :
                            podcast.getLikes().stream()
                                    .filter(like -> like.getTimestamp().isAfter(last24Hours))
                                    .count();

                    long comments24h = podcast.getComments() == null ? 0 :
                            podcast.getComments().stream()
                                    .filter(comment -> comment.getTimestamp().isAfter(last24Hours))
                                    .count();

                    long likes7d = podcast.getLikes() == null ? 0 :
                            podcast.getLikes().stream()
                                    .filter(like -> like.getTimestamp().isAfter(last7Days))
                                    .count();

                    long comments7d = podcast.getComments() == null ? 0 :
                            podcast.getComments().stream()
                                    .filter(comment -> comment.getTimestamp().isAfter(last7Days))
                                    .count();

                    // Tính score với trọng số khác nhau
                    double score = calculateTrendingScore(views, likes24h, comments24h, likes7d, comments7d);

                    PodcastModel model = mapToModel(podcast);

                    return new AbstractMap.SimpleEntry<>(model, score);
                })
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private double calculateTrendingScore(long views, long likes24h, long comments24h,
                                          long likes7d, long comments7d) {
        // Weighted scoring algorithm
        double viewsWeight = 1.0;
        double likes24hWeight = 5.0;
        double comments24hWeight = 8.0;
        double likes7dWeight = 2.0;
        double comments7dWeight = 3.0;

        // Time decay factor (newer interactions có trọng số cao hơn)
        double timeDecayFactor = 1.2;

        return (views * viewsWeight) +
                (likes24h * likes24hWeight * timeDecayFactor) +
                (comments24h * comments24hWeight * timeDecayFactor) +
                (likes7d * likes7dWeight) +
                (comments7d * comments7dWeight);
    }

    private void cacheTrendingPodcasts(List<PodcastModel> trendingPodcasts) {
        try {
            redisTemplate.opsForValue().set(
                    TRENDING_CACHE_KEY,
                    trendingPodcasts,
                    Duration.ofMinutes(1)
            );
            log.info("Cached {} trending podcasts", trendingPodcasts.size());
        } catch (Exception e) {
            log.error("Error caching trending podcasts", e);
        }
    }

    private PageDTO<PodcastModel> paginateResults(List<PodcastModel> allResults, int page, int size) {
        int startIndex = page * size;
        int endIndex = Math.min(startIndex + size, allResults.size());

        if (startIndex >= allResults.size()) {
            return new PageDTO<>(
                    Collections.emptyList(), size, page,
                    (allResults.size() + size - 1) / size, allResults.size()
            );
        }

        List<PodcastModel> pageContent = allResults.subList(startIndex, endIndex);
        int totalPages = (allResults.size() + size - 1) / size;

        return new PageDTO<>(
                pageContent, size, page, totalPages, allResults.size()
        );
    }

    // Scheduled method để update cache
    @Scheduled(fixedRate = 60000) // 1 phút
    @Async
    public void updateTrendingPodcastsCache() {
        // Sử dụng distributed lock để tránh multiple instances chạy cùng lúc
        String lockValue = UUID.randomUUID().toString();
        Boolean lockAcquired = redisTemplate.opsForValue()
                .setIfAbsent(TRENDING_LOCK_KEY, lockValue, Duration.ofMinutes(5));

        if (Boolean.TRUE.equals(lockAcquired)) {
            try {
//                log.info("Starting scheduled trending podcasts cache update");
                calculateAndCacheTrendingPodcasts();
//                log.info("Completed scheduled trending podcasts cache update");
            } catch (Exception e) {
                log.error("Error updating trending podcasts cache", e);
            } finally {
                // Release lock
                String currentLock = (String) redisTemplate.opsForValue().get(TRENDING_LOCK_KEY);
                if (lockValue.equals(currentLock)) {
                    redisTemplate.delete(TRENDING_LOCK_KEY);
                }
            }
        } else {
            log.info("Trending cache update already in progress, skipping");
        }
    }

    private PodcastModel mapToModel(PodcastEntity podcast) {
        UserSimple userSimple = modelMapper.map(podcast.getUser(), UserSimple.class);
        boolean isLiked = false;

        if (SecurityUtils.isAuthenticated()) {
            UserEntity auth = SecurityUtils.getCurrentUser();
            isLiked = podcastLikeRepository.existsByUserEntityIdAndPodcastEntityId(
                    auth.getId(), podcast.getId());
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
