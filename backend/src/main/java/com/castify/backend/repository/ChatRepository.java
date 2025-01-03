package com.castify.backend.repository;

import com.castify.backend.entity.ChatEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRepository extends MongoRepository<ChatEntity, String> {
    ChatEntity findChatEntityById(String id);

    @Query("{ 'memberList.memberId': ?0 }")
    Page<ChatEntity> findAllByMemberId(String memberId, Pageable pageable);
}
