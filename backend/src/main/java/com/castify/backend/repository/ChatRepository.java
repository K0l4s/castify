package com.castify.backend.repository;

import com.castify.backend.entity.ChatEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRepository extends MongoRepository<ChatEntity, String> {
    ChatEntity findChatEntityById(String id);
}
