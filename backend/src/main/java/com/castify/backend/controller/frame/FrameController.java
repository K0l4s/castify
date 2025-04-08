package com.castify.backend.controller.frame;

import com.castify.backend.models.frame.FrameModel;
import com.castify.backend.models.frame.UploadFrameRequest;
import com.castify.backend.models.ErrorResponse;
import com.castify.backend.service.frame.IFrameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//
//import java.awt.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/frame")

public class FrameController {
//    private static final Logger logger = LoggerFactory.getLogger(FrameController.class);
    @Autowired
    private IFrameService frameService;

    // For BlankShop
    // Get all accepted frames for public view
    @GetMapping("/all")
    public ResponseEntity<?> getAllAcceptedFrames() {
        try {
            List<FrameModel> frameModels = frameService.getAllAcceptedFrames();
            return new ResponseEntity<>(frameModels, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Purchase a frame
    @PostMapping("/purchase/{frameId}")
    public ResponseEntity<?> purchaseFrame(@PathVariable String frameId) {
        try {
            FrameModel purchasedFrame = frameService.purchaseFrame(frameId);
            return new ResponseEntity<>(purchasedFrame, HttpStatus.OK);
        } catch (Exception e) {
//            logger.error("Error purchasing frame: " + e.getMessage());
            return new ResponseEntity<>(new ErrorResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    // For MyShop
    // Upload
    @PostMapping ("/upload")
    public ResponseEntity<?> uploadFrame(@RequestPart("name") String name,
                                         @RequestPart("price") Integer price,
                                         @RequestPart("image") MultipartFile image) {
        try{
            UploadFrameRequest uploadFrameRequest = new UploadFrameRequest(name, price, image);
            FrameModel frameModel = frameService.uploadFrame(uploadFrameRequest);
            return new ResponseEntity<>(frameModel, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all frames of current user
    @GetMapping("/my-uploads")
    public ResponseEntity<?> getMyUploads() {
        try{
            List<FrameModel> frameModels = frameService.getUserUploadedFrames();
            return new ResponseEntity<>(frameModels, HttpStatus.OK);
        } catch(Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
