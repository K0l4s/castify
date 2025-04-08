package com.castify.backend.controller.frame;

import com.castify.backend.models.frame.FrameModel;
import com.castify.backend.models.frame.UploadFrameRequest;
import com.castify.backend.service.frame.IFrameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.util.List;

@RestController
@RequestMapping("/api/admin/v1/frame")

public class AdminFrameController {
    @Autowired
    private IFrameService frameService;

    @GetMapping("/all")
    public ResponseEntity<?> getAllFrames() {
        try {
            List<FrameModel> frameModels = frameService.getAllFrames();
            return new ResponseEntity<>(frameModels, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
