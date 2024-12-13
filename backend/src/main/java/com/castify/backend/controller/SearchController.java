package com.castify.backend.controller;

import com.castify.backend.service.podcast.IPodcastService;
import com.castify.backend.service.podcast.PodcastServiceImpl;
import com.castify.backend.service.search.ISearchService;
import com.castify.backend.service.search.SearchServiceImpl;
import com.castify.backend.service.user.IUserService;
import com.castify.backend.service.user.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("api/v1/search")
@RestController
public class SearchController {
    @Autowired
    private IUserService userService = new UserServiceImpl();
    @Autowired
    private IPodcastService podcastService = new PodcastServiceImpl();
    @Autowired
    private ISearchService searchService = new SearchServiceImpl();
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
}
