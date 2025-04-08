package com.castify.backend.service.conversation;

import com.castify.backend.entity.ChatEntity;
import com.castify.backend.models.conversation.CreateChatRequest;
import com.castify.backend.models.conversation.FullMemberInfor;
import com.castify.backend.models.conversation.MessageResponse;
import com.castify.backend.models.conversation.ShortConversationModel;
import com.castify.backend.models.paginated.PaginatedResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IChatService {
    ShortConversationModel createConversation(CreateChatRequest request) throws Exception;

    List<FullMemberInfor> addMemberToGroup(String groupId, List<String> memberIds) throws Exception;


    void deleteUser(String groupId, String userId) throws Exception;

    ShortConversationModel findShortConverById(String id);

    PaginatedResponse<ShortConversationModel> getConversationByUser(int pageNumber, int pageSize) throws Exception;

    MessageResponse sendMessage(String message, String groupId) throws Exception;

    PaginatedResponse<MessageResponse> getMessageByGroupId(String groupId, int pageNumber, int pageSize) throws Exception;

    List<String> getUserIdsInGroup(String groupId);

    void readLastedMessage(String groupId) throws Exception;

    ChatEntity getChatDetail(String groupId) throws Exception;

    List<FullMemberInfor> getMemberList(String groupId);

    boolean hasUnreadMessages() throws Exception;


    String updateGroupImage(MultipartFile imageFile, String groupId) throws Exception;

    String changeGroupName(String newName, String groupId) throws Exception;
}
