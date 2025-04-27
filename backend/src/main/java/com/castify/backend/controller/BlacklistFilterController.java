package com.castify.backend.controller;

import com.castify.backend.service.blacklist.IBlacklistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api/v1/blacklist")
@RestController
public class BlacklistFilterController {
    @Autowired
    private IBlacklistService blacklistService;
    @GetMapping("/")
    private ResponseEntity<?> getMsgFromChat(
            @RequestParam(value = "content") String content
    ) {
        try {
            return ResponseEntity.ok(blacklistService.calculateViolationScore(content));
        } catch (Exception ex) {
//            logger.info(ex.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
