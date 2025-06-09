package com.castify.backend.service.search;

import com.castify.backend.models.search.SearchKeywordModel;
import com.castify.backend.models.search.SearchResultModel;

import java.util.List;

public interface ISearchService {
    void saveKeyword(String keyword) throws Exception;

    // Main search
    SearchResultModel search(String keyword, String userId);

    // Get recent search history & trending
    List<SearchKeywordModel> getRecentHistory(String userId);
    List<SearchKeywordModel> getTrendingKeywords();

    // Get search suggestions based on prefix
    List<SearchKeywordModel> getSuggestions(String prefix, String userId);

    // Delete history
    void deleteHistoryItem(String userId, String keyword);
    void clearAllHistory(String userId);
}
