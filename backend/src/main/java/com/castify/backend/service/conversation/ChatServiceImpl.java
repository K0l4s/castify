package com.castify.backend.service.conversation;

import com.castify.backend.controller.ConversationController;
import com.castify.backend.entity.ChatEntity;
import com.castify.backend.entity.MessageEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.enums.MemberRole;
import com.castify.backend.enums.NotiType;
import com.castify.backend.models.conversation.*;
import com.castify.backend.models.paginated.PaginatedResponse;
import com.castify.backend.models.user.ShortUser;
import com.castify.backend.repository.ChatRepository;
import com.castify.backend.repository.MessageRepository;
import com.castify.backend.repository.UserRepository;
import com.castify.backend.service.notification.INotificationService;
import com.castify.backend.service.uploadFile.IUploadFileService;
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
import org.springframework.web.multipart.MultipartFile;

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
    @Autowired
    private IUploadFileService uploadFileService;
    @Autowired
    private INotificationService notificationService;
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
    public List<FullMemberInfor> addMemberToGroup(String groupId, List<String> memberIds) throws Exception {
        ChatEntity chat = chatRepository.findChatEntityById(groupId);
        for (MemberInfor member : chat.getMemberList()) {
            if(memberIds.contains(member.getMemberId()))
                throw new Exception("This member joined group, please try again!");
        }
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
        List<FullMemberInfor> newMemberAdded = new ArrayList<>();

        for (MemberInfor member : memberList) {
            // Lấy thông tin người dùng
            UserEntity user = userRepository.findById(member.getMemberId())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            // Map ShortUser từ UserEntity
            ShortUser shortUser = modelMapper.map(user, ShortUser.class);

            // Map FullMemberInfor từ MemberInfor
            FullMemberInfor fullMember = modelMapper.map(member, FullMemberInfor.class);
            fullMember.setMembers(shortUser);

            newMemberAdded.add(fullMember);
        }
        return newMemberAdded;
    }
    @Override
    public void deleteUser(String groupId, String userId) throws Exception {
        UserEntity userData = userService.getUserByAuthentication();
        ChatEntity chat = chatRepository.findChatEntityById(groupId);
        MemberInfor memberInfor = chat.getMemberList().stream()
                .filter(obj -> obj.getMemberId().equals(userData.getId()))
                .findFirst()
                .orElse(null);
        assert memberInfor != null;
        if(memberInfor.getRole().equals(MemberRole.LEADER) || memberInfor.getRole().equals(MemberRole.DEPUTY)) {
            List<MemberInfor> memberList = chat.getMemberList();
            memberList.removeIf(member -> member.getMemberId().equals(userId));
            chat.setMemberList(memberList);
            chatRepository.save(chat);
        } else {
            throw new Exception("You don't have permission!");
        }
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
        notificationService.saveNotification(user.getId(), NotiType.WARNING,"CẢNH BÁO VI PHẠM!","Tin nhắn của bạn có chứa từ khóa cấm, hãy thử lại sau!","");
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

        if (lastMessage == null) {
            return;
        }

        ChatEntity conver = chatRepository.findChatEntityById(groupId);


        conver.getMemberList().forEach(p -> {
            if (p.getMemberId().equals(currentUser.getId())) {
                LastReadMessage lastReadMessage = new LastReadMessage();
                    // Cập nhật nếu đã tồn tại
                lastReadMessage.setLastMessageId(lastMessage.getId());
                lastReadMessage.setLastReadTime(LocalDateTime.now());
                p.setLastReadMessage(lastReadMessage);
            }
        });

        chatRepository.save(conver);

        ShortUser user = modelMapper.map(currentUser, ShortUser.class);
        messagingTemplate.convertAndSend(
                "/topic/read/" + groupId,
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
    @Override
    public boolean hasUnreadMessages() throws Exception {
        // Lấy danh sách các nhóm mà người dùng tham gia
        UserEntity user = userService.getUserByAuthentication();
        List<ChatEntity> chats = chatRepository.findAllByMemberIdOrderByLastMessage(user.getId());
    logger.info(String.valueOf(chats.size()));
        for (ChatEntity chat : chats) {
            // Lấy thông tin thành viên trong nhóm
            MemberInfor member = chat.getMemberList().stream()
                    .filter(m -> m.getMemberId().equals(user.getId()))
                    .findFirst()
                    .orElse(null);

            // Nếu thành viên không tồn tại hoặc chưa có thời gian đọc tin nhắn
            if (member == null || member.getLastReadMessage() == null) {
                return true; // Nếu chưa có thời gian đọc tin nhắn, cho là chưa đọc
            }

            LocalDateTime lastReadTime = member.getLastReadMessage().getLastReadTime();

            // Kiểm tra xem có tin nhắn nào trong nhóm mà người dùng chưa đọc
            long unreadCount = messageRepository.countUnreadMessages(chat.getId(), lastReadTime).orElse(0L);
            if (unreadCount > 0) {
                return true; // Nếu có tin nhắn chưa đọc, trả về true
            }
        }

        return false; // Nếu không có nhóm nào có tin nhắn chưa đọc
    }
    @Override
    public String updateGroupImage(MultipartFile imageFile, String groupId) throws Exception {
        UserEntity userData = userService.getUserByAuthentication();
        ChatEntity chat = chatRepository.findChatEntityById(groupId);
        MemberInfor memberInfor = chat.getMemberList().stream()
                .filter(obj -> obj.getMemberId().equals(userData.getId()))
                .findFirst()
                .orElse(null);
        assert memberInfor != null;
        if(memberInfor.getRole().equals(MemberRole.LEADER) || memberInfor.getRole().equals(MemberRole.DEPUTY)) {
            String imageUrl = uploadFileService.uploadImage(imageFile);
            chat.setImageUrl(imageUrl);
            chatRepository.save(chat);
            return imageUrl;
        } else {
            throw new Exception("You don't have permission!");
        }
    }
    @Override
    public String changeGroupName(String newName, String groupId) throws Exception {
        UserEntity userData = userService.getUserByAuthentication();
        ChatEntity chat = chatRepository.findChatEntityById(groupId);
        MemberInfor memberInfor = chat.getMemberList().stream()
                .filter(obj -> obj.getMemberId().equals(userData.getId()))
                .findFirst()
                .orElse(null);
        assert memberInfor != null;
        if(memberInfor.getRole().equals(MemberRole.LEADER) || memberInfor.getRole().equals(MemberRole.DEPUTY)) {
            chat.setTitle(newName);
            chatRepository.save(chat);
            return chat.getTitle();
        }
        else {
            throw new Exception("You don't have permission!");
        }
    }

}
