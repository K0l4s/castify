package com.castify.backend.controller.frame;

import com.castify.backend.entity.FrameEventEntity;
import com.castify.backend.enums.FrameStatus;
import com.castify.backend.models.ErrorResponse;
import com.castify.backend.models.frame.CreateFrameEventModel;
import com.castify.backend.models.frame.FrameModel;
// import com.castify.backend.models.frame.UploadFrameRequest;
import com.castify.backend.models.frame.VoucherModelRequest;
import com.castify.backend.service.frame.FrameEventServiceImpl;
import com.castify.backend.service.frame.FrameServiceImpl;
import com.castify.backend.service.frame.IFrameService;
import com.castify.backend.service.uploadFile.UploadFileServiceImpl;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
// import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin/v1/frame")

public class AdminFrameController {
    @Autowired
    private IFrameService frameService;
    @Autowired
    private FrameEventServiceImpl frameEventService;

    @Autowired
    private UploadFileServiceImpl uploadFileService;

    @Autowired
    private ModelMapper modelMapper;
    @GetMapping("/all")
    public ResponseEntity<?> getAllFrames() {
        try {
            List<FrameModel> frameModels = frameService.getAllFrames();
            return new ResponseEntity<>(frameModels, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update frame status by admin
    @PutMapping("/approve/{frameId}")
    public ResponseEntity<?> updateFrameStatus(
            @PathVariable String frameId,
            @RequestParam("status") FrameStatus status) {
        try {
            FrameModel updatedFrame = frameService.updateFrameStatus(frameId, status);
            return new ResponseEntity<>(updatedFrame, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }
    @PostMapping("/voucher/add")
    public ResponseEntity<?> createVoucher(@RequestBody VoucherModelRequest voucher) {
        try {

            return new ResponseEntity<>(frameService.createVoucher(voucher), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }
    // Tạo mới FrameEvent và upload nhiều ảnh
    @PostMapping(path="/event/create",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FrameEventEntity> createFrameEvent(
            @RequestPart("data") CreateFrameEventModel frameEventModel,
            @RequestPart("images") MultipartFile[] images) throws IOException {

        List<String> imageUrls = new ArrayList<>();
        for (MultipartFile image : images) {
            String url = uploadFileService.uploadImage(image);
            imageUrls.add(url);
        }
        FrameEventEntity frameEvent = modelMapper.map(frameEventModel, FrameEventEntity.class);
        frameEvent.setBannersUrl(imageUrls);
        frameEvent.setCreateDate(LocalDateTime.now());

        FrameEventEntity savedEvent = frameEventService.createFrameEvent(frameEvent);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedEvent);
    }
    @GetMapping("/event/search")
    public ResponseEntity<List<FrameEventEntity>> searchFrameEvents(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false, defaultValue = "0") Integer pageNumber,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {

        List<FrameEventEntity> results = frameEventService.searchFrameEvent(
                keyword, fromDate, toDate, active, pageNumber, pageSize
        );

        return ResponseEntity.ok(results);
    }
}
