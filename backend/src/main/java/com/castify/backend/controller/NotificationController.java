package com.castify.backend.controller;

import com.castify.backend.models.genre.GenreModel;
import com.castify.backend.service.notification.INotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notification")
public class NotificationController {
    @Autowired
    private INotificationService notificationService;
    @GetMapping("")
    public ResponseEntity<?> getAllNoti(@RequestParam("pageNumber") int pageNumber,@RequestParam("pageSize")int pageSize) {
        try {
            return new ResponseEntity<>(notificationService.getNotiByUser(pageNumber,pageSize), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/read")
    public ResponseEntity<?> getTotalUnRead() {
        try {
            return new ResponseEntity<>(notificationService.getTotalUnreadNotifications(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PutMapping("/read")
    public ResponseEntity<?> readNoti(@RequestParam("id") String id){
        try {
            notificationService.readNotifi(id);
            return new ResponseEntity<>("Read Successful", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/read/all")
    public ResponseEntity<?> readAllNoti(){
        try {
            notificationService.makeReadAll();
            return new ResponseEntity<>("Read Successful", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
