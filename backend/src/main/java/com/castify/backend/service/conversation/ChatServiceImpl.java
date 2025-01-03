package com.castify.backend.service.conversation;

import com.castify.backend.controller.ConversationController;
import com.castify.backend.entity.ChatEntity;
import com.castify.backend.entity.MessageEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.enums.MemberRole;
import com.castify.backend.models.conversation.CreateChatRequest;
import com.castify.backend.models.conversation.MemberInfor;
import com.castify.backend.models.conversation.MessageResponse;
import com.castify.backend.models.conversation.ShortConversationModel;
import com.castify.backend.models.paginated.PaginatedResponse;
import com.castify.backend.repository.ChatRepository;
import com.castify.backend.repository.MessageRepository;
import com.castify.backend.service.user.IUserService;
import com.castify.backend.service.user.UserServiceImpl;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class ChatServiceImpl implements IChatService{
    @Autowired
    private ChatRepository chatRepository;
    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private IUserService userService = new UserServiceImpl();
    private static final Logger logger = Logger.getLogger(ConversationController.class.getName());

    @Override
    public ShortConversationModel createConversation(CreateChatRequest request) {
        ChatEntity chatEntity = modelMapper.map(request, ChatEntity.class);

        // Gán trạng thái mặc định cho Active
        chatEntity.setActive(true); // Hoặc false tùy vào logic của mày

        // Lưu chatEntity vào repository
        ChatEntity newConver = chatRepository.save(chatEntity);
        return modelMapper.map(newConver, ShortConversationModel.class);
    }

    @Override
    public void addMemberToGroup(String groupId, List<String> memberIds) {
        // Tạo danh sách MemberInfor từ memberIds
        List<MemberInfor> memberList = memberIds
                .stream()
                .map(uid -> {
                    MemberInfor member = new MemberInfor();
                    member.setMemberId(uid);
                    member.setRole(MemberRole.MEMBER);
                    member.setJoinTime(LocalDateTime.now());
                    return member;
                })
                .toList();

        // Lấy ChatEntity từ repository
        ChatEntity chatEntity = chatRepository.findChatEntityById(groupId);
        if (chatEntity == null) {
            throw new IllegalArgumentException("Group with ID " + groupId + " not found.");
        }

        // Thêm thành viên mới vào danh sách hiện có
        List<MemberInfor> existingMembers = chatEntity.getMemberList();
        existingMembers.addAll(memberList);
        chatEntity.setMemberList(existingMembers);

        // Lưu lại vào database
        chatRepository.save(chatEntity);
    }
    @Override
    public PaginatedResponse<ShortConversationModel> getConversationByUser(int pageNumber, int pageSize) throws Exception {
        UserEntity user = userService.getUserByAuthentication();
        Pageable pageable = PageRequest.of(pageNumber,pageSize, Sort.by(Sort.Direction.DESC,"createdAt"));
        Page<ChatEntity> conversations = chatRepository.findAllByMemberId(user.getId(),pageable);
        List<ShortConversationModel> converList = conversations.getContent().stream().map(model -> modelMapper.map(model, ShortConversationModel.class)).toList();
        return new PaginatedResponse<>(converList,conversations.getTotalPages());
    };
    @Override
    public MessageResponse sendMessage(String message, String groupId) throws Exception {
        UserEntity user = userService.getUserByAuthentication();
        checkValidMessage(groupId,user.getId());
        MessageEntity msg = new MessageEntity();
        msg.setSender(user);
        msg.setContent(message);
        msg.setChatId(groupId);
        MessageEntity newMess = messageRepository.save(msg);
        return modelMapper.map(newMess,MessageResponse.class);
    }
    private void checkValidMessage(String groupId, String userId){
        ChatEntity chatEntity = chatRepository.findChatEntityById(groupId);
        if(chatEntity == null) {
            throw new IllegalArgumentException("Group with ID " + groupId + " not found.");
        }if (chatEntity.getMemberList().isEmpty()) {
            throw new IllegalArgumentException("Group with ID " + groupId + " has no member list.");
        }
        if(chatEntity.getMemberList().stream().noneMatch(member -> member.getMemberId().equals(userId))) {
            throw new IllegalArgumentException("Group with ID " + groupId + " has no member list.");
        }
    }
    @Override
    public PaginatedResponse<MessageResponse> getMessageByGroupId(String groupId, int pageNumber, int pageSize) throws Exception {
        UserEntity user = userService.getUserByAuthentication();
        checkValidMessage(groupId, user.getId());
        Pageable pageable = PageRequest.of(pageNumber,pageSize);
        Page<MessageEntity> msgs = messageRepository.findMessageEntitiesByChatId(groupId,pageable);
        List<MessageResponse> responses = msgs.getContent().stream().map(msg -> modelMapper.map(msg,MessageResponse.class)).toList();
        logger.info(msgs.toString());
        return new PaginatedResponse<>(responses,msgs.getTotalPages());
    }
    @Override
    public List<String> getUserIdsInGroup(String groupId) {
        return chatRepository.findChatEntityById(groupId)
                .getMemberList()
                .stream()
                .map(MemberInfor::getMemberId) // Lấy memberId từ mỗi MemberInfor
                .collect(Collectors.toList()); // Thu thập thành List
    }

}
