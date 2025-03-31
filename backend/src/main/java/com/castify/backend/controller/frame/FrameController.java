package com.castify.backend.controller.frame;

import com.castify.backend.models.frame.FrameModel;
import com.castify.backend.models.frame.UploadFrameRequest;
import com.castify.backend.service.frame.IFrameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@RestController
@RequestMapping("/api/v1/frame")

public class FrameController {
    private static final Logger logger = LoggerFactory.getLogger(FrameController.class);
    @Autowired
    private IFrameService frameService;

    @PostMapping ("/upload")
    public ResponseEntity<?> uploadFrame(@RequestPart("name") String name,
                                      @RequestPart("image") MultipartFile image) {
        try{
            UploadFrameRequest uploadFrameRequest = new UploadFrameRequest(name, image);
            FrameModel frameModel = frameService.uploadFrame(uploadFrameRequest);
            logger.info("Successfully uploaded frame: {}", frameModel);
            return new ResponseEntity<>(frameModel, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error while uploading frame: {}", e.getMessage(), e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllAcceptedFrames() {
        System.out.println("getAllAcceptedFrames");
        try {
            List<FrameModel> frameModels = frameService.getAllAcceptedFrames();
            logger.info("All frames: {}", frameModels);
            return new ResponseEntity<>(frameModels, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
