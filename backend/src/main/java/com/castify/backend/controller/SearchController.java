package com.castify.backend.controller;

import com.castify.backend.models.search.SearchKeywordModel;
import com.castify.backend.models.search.SearchResultModel;
import com.castify.backend.service.podcast.IPodcastService;
import com.castify.backend.service.podcast.PodcastServiceImpl;
import com.castify.backend.service.search.ISearchService;
import com.castify.backend.service.search.SearchServiceImpl;
import com.castify.backend.service.user.IUserService;
import com.castify.backend.service.user.UserServiceImpl;
import com.castify.backend.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
@RestController
public class SearchController {
    private final IUserService userService;
    private final IPodcastService podcastService;
    private final ISearchService searchService;

    @GetMapping("/user")
    private ResponseEntity<?> getUser(
            @RequestParam(value = "pageNumber") Integer pageNumber,
            @RequestParam(value = "pageSize") Integer pageSize,
            @RequestParam(value = "keyword") String keyword
    ) throws Exception{
        try{

            return ResponseEntity.ok(
                    userService.searchUser(pageNumber,pageSize,keyword)
            );
        }catch (Exception ex){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error"+ex.getMessage());
        }
    }
    @GetMapping("/post")
    private ResponseEntity<?> getPost(
            @RequestParam(value = "pageNumber") Integer pageNumber,
            @RequestParam(value = "pageSize") Integer pageSize,
            @RequestParam(value = "keyword") String keyword
    ) throws Exception{
        searchService.saveKeyword(keyword);
        try{
            return ResponseEntity.ok(
                    podcastService.searchPodcast(pageNumber,pageSize,keyword)
            );
        }catch (Exception ex){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error"+ex.getMessage());
        }
    }

    @GetMapping
    @Operation(summary = "Main search endpoint - returns top 20 results from each category")
    public ResponseEntity<SearchResultModel> search(@RequestParam String keyword) {
        String userId = SecurityUtils.getCurrentUser().getId();
        SearchResultModel results = searchService.search(keyword, userId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/history")
    @Operation(summary = "Get recent search history - for when user focuses on input")
    public ResponseEntity<List<SearchKeywordModel>> getHistory() {
        String userId = SecurityUtils.getCurrentUser().getId();
        List<SearchKeywordModel> history = searchService.getRecentHistory(userId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/suggestions")
    @Operation(summary = "Get search suggestions - for debounced input typing")
    public ResponseEntity<List<SearchKeywordModel>> getSuggestions(@RequestParam String prefix) {
        String userId = SecurityUtils.getCurrentUser().getId();
        List<SearchKeywordModel> suggestions = searchService.getSuggestions(prefix, userId);
        return ResponseEntity.ok(suggestions);
    }

}
