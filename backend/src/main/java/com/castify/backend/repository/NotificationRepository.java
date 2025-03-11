package com.castify.backend.repository;

import com.castify.backend.entity.NotificationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<NotificationEntity, String> {
    Page<NotificationEntity> getNotificationEntitiesByReceiverId(String receiverId, Pageable pageable);
    NotificationEntity getNotificationEntityById(String id);
    long countByReceiverIdAndReadIsFalse(String receiverId);

    List<NotificationEntity> getNotificationEntitiesByReceiverIdAndReadIsFalse(String receiverId);
}
