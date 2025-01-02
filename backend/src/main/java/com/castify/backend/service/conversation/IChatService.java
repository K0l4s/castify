package com.castify.backend.service.conversation;

import com.castify.backend.models.conversation.CreateChatRequest;
import com.castify.backend.models.conversation.MessageResponse;
import com.castify.backend.models.conversation.ShortConversationModel;
import com.castify.backend.models.paginated.PaginatedResponse;

import java.util.List;

public interface IChatService {
    ShortConversationModel createConversation(CreateChatRequest request);

    void addMemberToGroup(String groupId, List<String> memberIds);


    PaginatedResponse<ShortConversationModel> getConversationByUser(int pageNumber, int pageSize) throws Exception;

    MessageResponse sendMessage(String message, String groupId) throws Exception;

    PaginatedResponse<MessageResponse> getMessageByGroupId(String groupId, int pageNumber, int pageSize) throws Exception;

    List<String> getUserIdsInGroup(String groupId);
}
