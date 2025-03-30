package com.castify.backend.service.conversation;

import com.castify.backend.controller.ConversationController;
import com.castify.backend.entity.ChatEntity;
import com.castify.backend.entity.MessageEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.enums.MemberRole;
import com.castify.backend.models.conversation.*;
import com.castify.backend.models.paginated.PaginatedResponse;
import com.castify.backend.models.user.ShortUser;
import com.castify.backend.repository.ChatRepository;
import com.castify.backend.repository.MessageRepository;
import com.castify.backend.repository.UserRepository;
import com.castify.backend.service.user.IUserService;
import com.castify.backend.service.user.UserServiceImpl;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class ChatServiceImpl implements IChatService {
    @Autowired
    private ChatRepository chatRepository;
    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private ModelMapper modelMapper;
    //    @Autowired
//    private ChatCustomRepository chatCustomRepository;
    @Autowired
    private IUserService userService = new UserServiceImpl();
    @Autowired
    private UserRepository userRepository;
    private static final Logger logger = Logger.getLogger(ConversationController.class.getName());
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Override
    public ShortConversationModel createConversation(CreateChatRequest request) throws Exception {
        ChatEntity chatEntity = modelMapper.map(request, ChatEntity.class);
        logger.info(request.toString());

        // Gán trạng thái mặc định cho Active
        chatEntity.setActive(true); // Hoặc false tùy vào logic của mày
        UserEntity user = userService.getUserByAuthentication();
        List<MemberInfor> updatedMemberList = request.getMemberList().stream()
                .map(member -> {
                    if (member.getMemberId().equals(user.getId())) {
                        member.setIsAccepted(true); // hoặc sửa gì tuỳ ý mày
                        // member.setRole("LEADER"); // nếu cần
                    }
                    return member;
                })
                .collect(Collectors.toList());

        request.setMemberList(updatedMemberList);        // Lưu chatEntity vào repository
        ChatEntity newConver = chatRepository.save(chatEntity);
        logger.info(newConver.toString());
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
    public ShortConversationModel findShortConverById(String id){
        ChatEntity chatEntity = chatRepository.findChatEntityById(id);
        return modelMapper.map(chatEntity,ShortConversationModel.class);
    }
    @Override
    public PaginatedResponse<ShortConversationModel> getConversationByUser(int pageNumber, int pageSize) throws Exception {
        UserEntity user = userService.getUserByAuthentication();

        // Lấy toàn bộ danh sách conversations theo user ID
        List<ChatEntity> conversations = chatRepository.findAllByMemberIdOrderByLastMessage(user.getId());
        // Ánh xạ từ ChatEntity sang ShortConversationModel và gắn thêm lastMessageTimestamp
        List<ShortConversationModel> conversationModels = new java.util.ArrayList<>(conversations.stream().map(chat -> {
            ShortConversationModel model = modelMapper.map(chat, ShortConversationModel.class);

            // Lấy lastMessage cho mỗi conversation
            MessageEntity lastMessage = messageRepository.findTopByChatIdOrderByTimestampDesc(chat.getId());
            if (lastMessage != null) {
                MessageResponse messageResponse = modelMapper.map(lastMessage, MessageResponse.class);
                ChatEntity conver = chatRepository.findChatEntityById(messageResponse.getChatId());
                for (MemberInfor props : conver.getMemberList()) {
                    if (props.getMemberId().equals(user.getId())) {
                        LastReadMessage lastRead = props.getLastReadMessage();
                        if (lastRead != null) {
                            messageResponse.setRead(lastRead.getLastMessageId().equals(lastMessage.getId()));
                        } else {
                            messageResponse.setRead(false); // hoặc true tùy vào logic
                        }
                        break;
                    }

                }
                model.setLastMessage(messageResponse);
            } else {
                model.setLastMessage(null);
//                model.setLastMessageTimestamp(null); // Xử lý trường hợp không có lastMessage
            }
            return model;
        }).toList());

        // Sắp xếp danh sách theo lastMessageTimestamp giảm dần
        // Sắp xếp danh sách theo lastMessageTimestamp giảm dần, nếu null thì sắp xếp theo createdAt
        conversationModels.sort((a, b) -> {
                if (a.getLastMessage() == null && b.getLastMessage() == null) {
                    return b.getCreatedAt().compareTo(a.getCreatedAt()); // So sánh createdAt nếu cả hai đều không có lastMessage
                }
                if (a.getLastMessage() == null) return 1; // a không có lastMessage -> đưa xuống
                if (b.getLastMessage() == null) return -1; // b không có lastMessage -> đưa xuống
                return b.getLastMessage().getTimestamp().compareTo(a.getLastMessage().getTimestamp()); // So sánh lastMessage timestamp
        });


        // Tổng số conversations
        int totalConversations = conversationModels.size();

        // Tính toán vị trí bắt đầu và kết thúc của trang
        int startIndex = pageNumber * pageSize;
        int endIndex = Math.min(startIndex + pageSize, totalConversations);

        // Kiểm tra nếu startIndex vượt quá số lượng conversations
        if (startIndex > totalConversations) {
            return new PaginatedResponse<>(Collections.emptyList(), 0);
        }

        // Lấy danh sách con cho trang hiện tại
        List<ShortConversationModel> paginatedConversations = conversationModels.subList(startIndex, endIndex);

        // Trả về response với dữ liệu phân trang
        int totalPages = (int) Math.ceil((double) totalConversations / pageSize);
        return new PaginatedResponse<>(paginatedConversations, totalPages);
    }

    @Override
    public MessageResponse sendMessage(String message, String groupId) throws Exception {
        UserEntity user = userService.getUserByAuthentication();
        checkValidMessage(groupId, user.getId());
        MessageEntity msg = new MessageEntity();
        msg.setSender(user);
        msg.setContent(message);
        msg.setChatId(groupId);
        MessageEntity newMess = messageRepository.save(msg);
        return modelMapper.map(newMess, MessageResponse.class);
    }

    private void checkValidMessage(String groupId, String userId) {
        ChatEntity chatEntity = chatRepository.findChatEntityById(groupId);
        if (chatEntity == null) {
            throw new IllegalArgumentException("Group with ID " + groupId + " not found.");
        }
        if (chatEntity.getMemberList().isEmpty()) {
            throw new IllegalArgumentException("Group with ID " + groupId + " has no member list.");
        }
        if (chatEntity.getMemberList().stream().noneMatch(member -> member.getMemberId().equals(userId))) {
            throw new IllegalArgumentException("Group with ID " + groupId + " has no member list.");
        }
    }

    @Override
    public PaginatedResponse<MessageResponse> getMessageByGroupId(String groupId, int pageNumber, int pageSize) throws Exception {
        UserEntity user = userService.getUserByAuthentication();
        checkValidMessage(groupId, user.getId());
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "timestamp"));
        Page<MessageEntity> msgs = messageRepository.findMessageEntitiesByChatId(groupId, pageable);
        List<MessageResponse> responses = msgs.getContent().stream().map(msg -> modelMapper.map(msg, MessageResponse.class)).toList();
        logger.info(msgs.toString());
        return new PaginatedResponse<>(responses, msgs.getTotalPages());
    }

    @Override
    public List<String> getUserIdsInGroup(String groupId) {
        return chatRepository.findChatEntityById(groupId)
                .getMemberList()
                .stream()
                .map(MemberInfor::getMemberId) // Lấy memberId từ mỗi MemberInfor
                .collect(Collectors.toList()); // Thu thập thành List
    }
    @Override
    public void readLastedMessage(String groupId) throws Exception {
        UserEntity currentUser = userService.getUserByAuthentication();

        MessageEntity lastMessage = messageRepository
                .findTopByChatIdOrderByTimestampDesc(groupId);

        if (lastMessage == null){
            
            return;
        }

        ChatEntity conver = chatRepository.findChatEntityById(groupId);

        String lastedUserMessageId = conver.getMemberList().stream()
                .filter(p -> p.getMemberId().equals(currentUser.getId()))
                .map(p -> {
                    LastReadMessage msg = p.getLastReadMessage();
                    return msg != null ? msg.getLastMessageId() : null;
                })
                .findFirst()
                .orElse(null);


        if (lastMessage.getId().equals(lastedUserMessageId))
            return;

        conver.getMemberList().forEach(p -> {
            if (p.getMemberId().equals(currentUser.getId())) {
                if (p.getLastReadMessage() == null) {
                    p.setLastReadMessage(new LastReadMessage());
                }
                p.getLastReadMessage().setLastMessageId(lastMessage.getId());
                p.getLastReadMessage().setLastReadTime(LocalDateTime.now());
            }
        });


        chatRepository.save(conver);
        ShortUser user = modelMapper.map(currentUser,ShortUser.class);
        messagingTemplate.convertAndSend(
                "/topic/group/read" + groupId,
                user
        );
    }

    @Override
    public ChatEntity getChatDetail(String groupId) throws Exception {
        return chatRepository.findChatEntityById(groupId);
    }
    @Override
    public List<FullMemberInfor> getMemberList(String groupId) {
        ChatEntity chat = chatRepository.findChatEntityById(groupId);
        if (chat == null) {
            throw new IllegalArgumentException("Group not found");
        }

        List<FullMemberInfor> memberList = new ArrayList<>();

        for (MemberInfor member : chat.getMemberList()) {
            // Lấy thông tin người dùng
            UserEntity user = userRepository.findById(member.getMemberId())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            // Map ShortUser từ UserEntity
            ShortUser shortUser = modelMapper.map(user, ShortUser.class);

            // Map FullMemberInfor từ MemberInfor
            FullMemberInfor fullMember = modelMapper.map(member, FullMemberInfor.class);
            fullMember.setMembers(shortUser);

            memberList.add(fullMember);
        }

        return memberList;
    }

}
