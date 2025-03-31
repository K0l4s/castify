package com.castify.backend.controller;

import com.castify.backend.models.conversation.CreateChatRequest;
import com.castify.backend.models.conversation.SendMessageReq;
import com.castify.backend.models.conversation.ShortConversationModel;
import com.castify.backend.service.conversation.ChatServiceImpl;
import com.castify.backend.service.conversation.IChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.logging.Logger;

@RequestMapping("/api/v1/conversation")
@RestController
public class ConversationController {
    @Autowired
    private IChatService chatService = new ChatServiceImpl();
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private static final Logger logger = Logger.getLogger(ConversationController.class.getName());

    @GetMapping("")
    private ResponseEntity<?> getByMember(@RequestParam(value = "pageSize") int pageSize, @RequestParam(value = "pageNumber") int pageNumber) {
        try {

            return ResponseEntity.ok(chatService.getConversationByUser(pageNumber, pageSize));
        } catch (Exception ex) {
            logger.info(ex.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/")
    private ResponseEntity<?> createChat(@RequestBody CreateChatRequest request) {
        try {

            return ResponseEntity.ok(chatService.createConversation(request));
        } catch (Exception ex) {
            logger.info(ex.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/msg")
    private ResponseEntity<?> sendMsg(@RequestBody SendMessageReq req, @RequestParam("groupId") String groupId) {
        try {
            var messages = chatService.sendMessage(req.getMessage(), groupId);
// Gửi tin nhắn tới tất cả user trong group
            messagingTemplate.convertAndSend(
                    "/topic/group/" + groupId,
                    messages
            );

            logger.info("✅ Message broadcasted to group: " + groupId);
            ShortConversationModel shortConversationModel = chatService.findShortConverById(groupId);
//            shortConversationModel.setLastMessage(messages.getContent());
//            shortConversationModel.setLastMessageTimestamp(messages.getTimestamp());
            shortConversationModel.setLastMessage(messages);
            // Gửi thông báo tới từng user
            List<String> userIds = chatService.getUserIdsInGroup(groupId); // Lấy danh sách userId trong group
            for (String userId : userIds) {
                messagingTemplate.convertAndSendToUser(
                        userId,
                        "/queue/msg",
                        shortConversationModel
                );
                logger.info("🔔 Notification sent to user: " + userId);
            }
            return ResponseEntity.ok(messages);
        } catch (Exception ex) {
            logger.info(ex.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/msg")
    private ResponseEntity<?> getMsgFromChat(
            @RequestParam(value = "groupId") String groupId,
            @RequestParam(value = "pageNumber") int pageNumber,
            @RequestParam(value = "pageSize") int pageSize
    ) {
        try {
            return ResponseEntity.ok(chatService.getMessageByGroupId(groupId, pageNumber, pageSize));
        } catch (Exception ex) {
            logger.info(ex.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/add")
    private ResponseEntity<?> addMemberToChat(@RequestParam String groupId, @RequestBody List<String> memberIds) {
        try {
//            chatService.createConversation(request);
            chatService.addMemberToGroup(groupId, memberIds);
            return ResponseEntity.ok("OK!");
        } catch (Exception ex) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/msg/read")
    private ResponseEntity<?> readMessage(@RequestParam("groupId") String groupId) {
        try {
//            chatService.createConversation(request);
            chatService.readLastedMessage(groupId);

            return ResponseEntity.ok("OK!");
        } catch (Exception ex) {
            logger.info(ex.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @GetMapping("/msg/detail")
    private ResponseEntity<?> getDetailChat(@RequestParam("groupId") String groupId) throws Exception {
        try{
            return ResponseEntity.ok(chatService.getChatDetail(groupId));
        } catch (Exception ex) {
            logger.info(ex.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/msg/members")
    private ResponseEntity<?> getMembers(@RequestParam("groupId") String groupId) throws Exception {
        try{
            return ResponseEntity.ok(chatService.getMemberList(groupId));
        } catch (Exception ex) {
            logger.info(ex.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/isUnread")
    private ResponseEntity<?> hasUnreadMsg() throws Exception {
        try{
            return ResponseEntity.ok(chatService.hasUnreadMessages());
        } catch (Exception ex) {
            logger.info(ex.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
