package com.castify.backend.controller;

import com.castify.backend.models.TrackingRequest;
import com.castify.backend.service.tracking.IVideoTracking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.logging.Logger;

@RequestMapping("api/v1/tracking")
@RestController
public class TrackingController {
    @Autowired
    private IVideoTracking videoTracking;
    private static final Logger logger = Logger.getLogger(PodcastController.class.getName());

    @PostMapping()
    public ResponseEntity<?> trackVideo(@RequestBody TrackingRequest request) {
        // Cập nhật vào DB như thể đây là PUT
        videoTracking.updateTracking(request.getUserId(), request.getPodcastId(), request.getPauseTime());
        logger.info("Da luu tracking thanh cong cho "+request.getPodcastId());

        return ResponseEntity.ok().build();
    }

    @GetMapping("/podcast")
    private ResponseEntity<?> getTrackingByPodcast(
            @RequestParam(value = "podcastId") String podcastId
    ) throws Exception{
        try{
            return ResponseEntity.ok(
                    videoTracking.getVideoTrackingByPodcastAndUser(podcastId)
            );
        }catch (Exception ex){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error"+ex.getMessage());
        }
    }
}
