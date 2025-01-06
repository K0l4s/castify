package com.castify.backend.repository;

import com.castify.backend.entity.ChatEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends MongoRepository<ChatEntity, String> {
    ChatEntity findChatEntityById(String id);
    @Query("{ 'memberList.memberId': ?0 }")
    List<ChatEntity> findAllByMemberIdOrderByLastMessage(String userId);

//    Page<ChatEntity> findAllByMemberId(String memberId, Pageable pageable);
}
