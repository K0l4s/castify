package com.castify.backend.repository;

import com.castify.backend.entity.MessageEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface MessageRepository extends MongoRepository<MessageEntity, String> {
    Page<MessageEntity> findMessageEntitiesByChatId(String chatId, Pageable pageable);
    MessageEntity findTopByChatIdOrderByTimestampDesc(String chatId);

    @Query(value = "{ 'chatId': ?0 }", sort = "{ 'timestamp': -1 }")
    Optional<MessageEntity> findTopByChatIdAndSenderIdOrderByTimestampDesc(String chatId);
    @Aggregation(pipeline = {
            "{ $match: { 'chatId': ?0, 'timestamp': { $gt: ?1 } } }",
            "{ $count: 'unreadCount' }"
    })
    Optional<Long> countUnreadMessages(String chatId, LocalDateTime lastReadTime);

}
