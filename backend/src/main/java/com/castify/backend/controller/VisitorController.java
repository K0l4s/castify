package com.castify.backend.controller;

import com.castify.backend.models.visitor.VisitorModel;
import com.castify.backend.service.visitor.IVisitorService;
import com.castify.backend.service.visitor.VisitorServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/track")
public class VisitorController {
    @Autowired
    private IVisitorService visitorService = new VisitorServiceImpl();
    @PostMapping
    public ResponseEntity<?> trackVisitor(@RequestBody VisitorModel model){
        try{
            return ResponseEntity.ok(
                    visitorService.trackVisitor(model)
            );
        }catch (Exception ex){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error"+ex.getMessage());
        }
    }
}
