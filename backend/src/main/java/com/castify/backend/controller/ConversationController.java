package com.castify.backend.controller;

import com.castify.backend.models.conversation.CreateChatRequest;
import com.castify.backend.service.conversation.ChatServiceImpl;
import com.castify.backend.service.conversation.IChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/api/v1/conversation")
@RestController
public class ConversationController {
    @Autowired
    private IChatService chatService = new ChatServiceImpl();

    @PostMapping("/")
    private ResponseEntity<?> createChat(@RequestBody CreateChatRequest request) {
//        try {
            chatService.createConversation(request);
            return ResponseEntity.ok("OK!");
//        } catch (Exception ex) {
//            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
//        }
    }

    @PutMapping("/add")
    private ResponseEntity<?> addMemberToChat(@RequestParam String groupId, @RequestBody List<String> memberIds){
        try {
//            chatService.createConversation(request);
            chatService.addMemberToGroup(groupId,memberIds);
            return ResponseEntity.ok("OK!");
        } catch (Exception ex) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
