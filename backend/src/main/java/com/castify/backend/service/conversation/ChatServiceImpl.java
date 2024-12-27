package com.castify.backend.service.conversation;

import com.castify.backend.entity.ChatEntity;
import com.castify.backend.enums.MemberRole;
import com.castify.backend.models.conversation.CreateChatRequest;
import com.castify.backend.models.conversation.MemberInfor;
import com.castify.backend.repository.ChatRepository;
import com.castify.backend.repository.MessageRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatServiceImpl implements IChatService{
    @Autowired
    private ChatRepository chatRepository;
    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private ModelMapper modelMapper;

    @Override
    public void createConversation(CreateChatRequest request) {
        ChatEntity chatEntity = modelMapper.map(request, ChatEntity.class);

        // Gán trạng thái mặc định cho Active
        chatEntity.setActive(true); // Hoặc false tùy vào logic của mày

        // Lưu chatEntity vào repository
        chatRepository.save(chatEntity);
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

}
