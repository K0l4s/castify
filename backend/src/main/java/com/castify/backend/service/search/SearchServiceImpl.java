package com.castify.backend.service.search;

import com.castify.backend.entity.SearchHistoryEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.models.search.SearchKeywordModel;
import com.castify.backend.models.search.SearchResultModel;
import com.castify.backend.repository.SearchHistoryRepository;
import com.castify.backend.service.playlist.IPlaylistService;
import com.castify.backend.service.podcast.IPodcastService;
import com.castify.backend.service.user.IUserService;
import com.castify.backend.service.user.UserServiceImpl;
import com.castify.backend.service.watchParty.IWatchPartyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class SearchServiceImpl implements ISearchService {
    private final SearchHistoryRepository searchHistoryRepository;
    private final IPodcastService podcastService;
    private final IUserService userService;
    private final IPlaylistService playlistService;
    private final IWatchPartyService watchPartyService;

    @Override
    public void saveKeyword(String keyword) throws Exception {
        try {
            UserEntity currentUser = userService.getUserByAuthentication();
            SearchHistoryEntity newSearch = new SearchHistoryEntity();
            newSearch.setKeyword(keyword);
            newSearch.setUserId(currentUser.getId());
            searchHistoryRepository.save(newSearch);
        } catch (Exception ignored){

        }
    }

    @Override
    @Cacheable(value = "searchResults", key = "#keyword + '_' + #userId")
    public SearchResultModel search(String keyword, String userId) {
        long startTime = System.currentTimeMillis();

        try {
            // Record search history only if user is authenticated
            if (userId != null) {
                recordSearchHistory(keyword, userId);
            }

            SearchResultModel result = new SearchResultModel();
            result.setKeyword(keyword);

            // Search each category with limit 20
            Pageable limit20 = PageRequest.of(0, 20);

            // Search podcasts
            result.setPodcasts(podcastService.searchPodcasts(keyword, limit20).getContent());

            // Search users
            result.setUsers(userService.searchUsers(keyword, limit20).getContent());

            // Search playlists
            result.setPlaylists(playlistService.searchPlaylists(keyword, limit20).getContent());

            // Search watch party rooms
            result.setWatchPartyRooms(watchPartyService.searchRooms(keyword, limit20).getContent());

            long endTime = System.currentTimeMillis();
            result.setSearchDuration(endTime - startTime);

            return result;

        } catch (Exception e) {
            log.error("Error during search for keyword: {}", keyword, e);
            SearchResultModel errorResult = new SearchResultModel();
            errorResult.setKeyword(keyword);
            errorResult.setPodcasts(new ArrayList<>());
            errorResult.setUsers(new ArrayList<>());
            errorResult.setPlaylists(new ArrayList<>());
            errorResult.setWatchPartyRooms(new ArrayList<>());
            errorResult.setSearchDuration(System.currentTimeMillis() - startTime);
            return errorResult;
        }
    }

    @Override
    @Cacheable(value = "recentHistory", key = "#userId")
    public List<SearchKeywordModel> getRecentHistory(String userId) {
        if (userId == null) {
            return new ArrayList<>();
        }

        try {
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            Pageable pageable = PageRequest.of(0, 5, Sort.by("lastSearched").descending());

            List<SearchHistoryEntity> recentHistory = searchHistoryRepository
                    .findRecentByUserId(userId, thirtyDaysAgo, pageable);

            return recentHistory.stream()
                    .map(history -> new SearchKeywordModel(history.getKeyword(), history.getSearchCount()))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error getting recent history for user: {}", userId, e);
            return new ArrayList<>();
        }
    }

    @Override
    @Cacheable(value = "trendingKeywords")
    public List<SearchKeywordModel> getTrendingKeywords() {
        try {
            LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
            Pageable pageable = PageRequest.of(0, 50, Sort.by("searchCount").descending());

            List<SearchHistoryEntity> allTrending = searchHistoryRepository
                    .findTrendingKeywords(sevenDaysAgo, pageable);

            // ✅ Remove duplicates by normalizedKeyword, keep highest searchCount
            return allTrending.stream()
                    .collect(Collectors.groupingBy(
                            SearchHistoryEntity::getNormalizedKeyword,
                            Collectors.maxBy((h1, h2) -> h1.getSearchCount().compareTo(h2.getSearchCount()))
                    ))
                    .values()
                    .stream()
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .sorted((h1, h2) -> h2.getSearchCount().compareTo(h1.getSearchCount()))
                    .limit(5)
                    .map(history -> new SearchKeywordModel(history.getKeyword(), history.getSearchCount()))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error getting trending keywords", e);
            return new ArrayList<>();
        }
    }

    @Override
    @Cacheable(value = "suggestions", key = "#prefix + '_' + #userId")
    public List<SearchKeywordModel> getSuggestions(String prefix, String userId) {
        try {
            if (prefix == null || prefix.trim().length() < 2) {
                return new ArrayList<>();
            }

            String normalizedPrefix = normalizeKeyword(prefix);
            Pageable pageable = PageRequest.of(0, 8, Sort.by("searchCount").descending());

            List<SearchHistoryEntity> suggestions = searchHistoryRepository
                    .findSuggestionsByPrefix(normalizedPrefix, pageable);

            return suggestions.stream()
                    .map(history -> new SearchKeywordModel(history.getKeyword(), history.getSearchCount()))
                    .distinct()
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error getting suggestions for prefix: {}", prefix, e);
            return new ArrayList<>();
        }
    }

    @Override
    @CacheEvict(value = "recentHistory", key = "#userId")
    public void deleteHistoryItem(String userId, String keyword) {
        if (userId == null) {
            throw new IllegalArgumentException("User must be authenticated to clear history");
        }
        
        try {
            String normalizedKeyword = normalizeKeyword(keyword);
            searchHistoryRepository.deleteByUserIdAndNormalizedKeyword(userId, normalizedKeyword);
            log.info("Deleted history item for user: {} keyword: {}", userId, keyword);
        } catch (Exception e) {
            log.error("Error deleting history item for user: {} keyword: {}", userId, keyword, e);
        }
    }

    @Override
    @CacheEvict(value = "recentHistory", key = "#userId")
    public void clearAllHistory(String userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User must be authenticated to clear history");
        }

        try {
            searchHistoryRepository.deleteByUserId(userId);
            log.info("Cleared all history for user: {}", userId);
        } catch (Exception e) {
            log.error("Error clearing all history for user: {}", userId, e);
        }
    }

    // Helper method to record search history
    private void recordSearchHistory(String keyword, String userId) {
        if (userId == null) {
            return;
        }

        try {
            String normalizedKeyword = normalizeKeyword(keyword);

            Optional<SearchHistoryEntity> existingHistory = searchHistoryRepository
                    .findByUserIdAndNormalizedKeyword(userId, normalizedKeyword);

            if (existingHistory.isPresent()) {
                SearchHistoryEntity history = existingHistory.get();
                history.incrementSearchCount();
                searchHistoryRepository.save(history);
            } else {
                SearchHistoryEntity newHistory = new SearchHistoryEntity(
                        userId, keyword, normalizedKeyword
                );
                searchHistoryRepository.save(newHistory);
            }

        } catch (Exception e) {
            log.error("Error recording search history for keyword: {} and user: {}", keyword, userId, e);
        }
    }

    // Helper method to normalize keyword
    private String normalizeKeyword(String keyword) {
        if (keyword == null) return "";

        return Normalizer.normalize(keyword, Normalizer.Form.NFD)
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
                .toLowerCase()
                .trim()
                .replaceAll("\\s+", " ");
    }
}
