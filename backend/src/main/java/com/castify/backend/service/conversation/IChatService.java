package com.castify.backend.service.conversation;

import com.castify.backend.entity.ChatEntity;
import com.castify.backend.models.conversation.CreateChatRequest;
import com.castify.backend.models.conversation.FullMemberInfor;
import com.castify.backend.models.conversation.MessageResponse;
import com.castify.backend.models.conversation.ShortConversationModel;
import com.castify.backend.models.paginated.PaginatedResponse;
import com.castify.backend.repository.ChatRepository;
import com.castify.backend.repository.MessageRepository;

import java.util.List;

public interface IChatService {
    ShortConversationModel createConversation(CreateChatRequest request) throws Exception;

    void addMemberToGroup(String groupId, List<String> memberIds);


    ShortConversationModel findShortConverById(String id);

    PaginatedResponse<ShortConversationModel> getConversationByUser(int pageNumber, int pageSize) throws Exception;

    MessageResponse sendMessage(String message, String groupId) throws Exception;

    PaginatedResponse<MessageResponse> getMessageByGroupId(String groupId, int pageNumber, int pageSize) throws Exception;

    List<String> getUserIdsInGroup(String groupId);

    void readLastedMessage(String groupId) throws Exception;

    ChatEntity getChatDetail(String groupId) throws Exception;

    List<FullMemberInfor> getMemberList(String groupId);

    boolean hasUnreadMessages() throws Exception;
}
