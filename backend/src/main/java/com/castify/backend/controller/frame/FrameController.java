package com.castify.backend.controller.frame;

import com.castify.backend.models.frame.FrameModel;
import com.castify.backend.models.frame.UploadFrameRequest;
import com.castify.backend.models.ErrorResponse;
import com.castify.backend.models.frame.VoucherModelRequest;
import com.castify.backend.service.frame.FrameEventServiceImpl;
import com.castify.backend.service.frame.IFrameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
    @Autowired
    private FrameEventServiceImpl frameEventServiceImpl;

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
    public ResponseEntity<?> purchaseFrame(@PathVariable String frameId,@RequestParam(required = false) String voucherCode) {
        try {
            FrameModel purchasedFrame = frameService.purchaseFrame(frameId,voucherCode);
            return new ResponseEntity<>(purchasedFrame, HttpStatus.OK);
        } catch (Exception e) {
//            logger.error("Error purchasing frame: " + e.getMessage());
            return new ResponseEntity<>(new ErrorResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    // Get all frames that user has purchased
    @GetMapping("/purchased")
    public ResponseEntity<?> getPurchasedFrames() {
        try {
            List<FrameModel> purchasedFrames = frameService.getPurchasedFrames();
            return new ResponseEntity<>(purchasedFrames, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse(e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // For MyShop
    // Upload
    @PostMapping (value="/upload")
//            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadFrame(@RequestParam("name") String name,
                                         @RequestParam("price") Integer price,
                                         @RequestParam("image") MultipartFile image) {
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

    // Update frame by user (name and price)
    @PutMapping("/update/{frameId}")
    public ResponseEntity<?> updateFrame(
            @PathVariable String frameId,
            @RequestParam("name") String name,
            @RequestParam("price") Integer price) {
        try {
            FrameModel updatedFrame = frameService.updateFrameByUser(frameId, name, price);
            return new ResponseEntity<>(updatedFrame, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    // Delete frame
    @DeleteMapping("/delete/{frameId}")
    public ResponseEntity<?> deleteFrame(@PathVariable String frameId) {
        try {
            frameService.deleteFrame(frameId);
            return new ResponseEntity<>("Frame deleted successfully", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/apply/{frameId}")
    public ResponseEntity<?> applyFrame(@PathVariable String frameId) {
        try {
            frameService.applyFrame(frameId);
            return new ResponseEntity<>("Frame applied successfully", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }
    @DeleteMapping("/cancel")
    public ResponseEntity<?> cancelFrame() {
        try {
            frameService.cancelCurrentFrame();
            return new ResponseEntity<>("Frame applied successfully", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/event")
    public ResponseEntity<?> findFrame(
    ) {
        try {
//            frameService.cancelCurrentFrame();
            return new ResponseEntity<>(frameEventServiceImpl.getActiveFrameEvent(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

}
