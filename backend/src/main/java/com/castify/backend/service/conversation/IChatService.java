package com.castify.backend.service.conversation;

import com.castify.backend.models.conversation.CreateChatRequest;

import java.util.List;

public interface IChatService {
    void createConversation(CreateChatRequest request);

    void addMemberToGroup(String groupId, List<String> memberIds);
}
