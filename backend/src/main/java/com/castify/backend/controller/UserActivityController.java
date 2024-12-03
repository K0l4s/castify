package com.castify.backend.controller;

import com.castify.backend.models.PageDTO;
import com.castify.backend.models.userActivity.AddActivityRequestDTO;
import com.castify.backend.models.userActivity.UserActivityModel;
import com.castify.backend.service.userActivity.UserActivityServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/activities")
public class UserActivityController {
    @Autowired
    private UserActivityServiceImpl userActivityService;

    @PostMapping("/add")
    public ResponseEntity<Void> addActivity(@RequestBody AddActivityRequestDTO requestDTO) {
        try {
            userActivityService.addActivity(requestDTO);
            return new ResponseEntity<>(HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/view-podcast")
    public ResponseEntity<PageDTO<UserActivityModel>> getViewPodcastActivitiesByDate(
            @RequestParam(defaultValue = "0") int page
    ) {
        try {
            return ResponseEntity.ok(userActivityService.getViewPodcastActivitiesByDate(page));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/remove/{id}")
    public ResponseEntity<Void> removeViewPodcastActivity(@PathVariable String id) {
        try {
            userActivityService.removeViewPodcastActivity(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/remove/all")
    public ResponseEntity<Void> removeViewPodcastActivity() {
        try {
            userActivityService.removeAllViewPodcastActivities();
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}
