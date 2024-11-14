package com.castify.backend.controller;

import com.castify.backend.models.podcast.CreatePodcastModel;
import com.castify.backend.models.podcast.PodcastModel;
import com.castify.backend.service.podcast.IPodcastService;
import com.castify.backend.service.podcast.PodcastServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/podcast")
public class PodcastController {
    @Autowired
    public IPodcastService podcastService = new PodcastServiceImpl();

    @PostMapping("/create")
    public ResponseEntity<?> createPodcast(@RequestBody CreatePodcastModel createPodcastModel) {
        try {
            return ResponseEntity.ok(podcastService.createPodcast(createPodcastModel));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }
}
