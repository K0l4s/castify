package com.castify.backend.entity;

import org.springframework.data.annotation.Id; // Sửa dòng này
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "chat")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ChatEntity {
    @Id
    private String id;
    private String title;
    private String imageUrl;

    @DBRef
    private List<UserEntity> member;

    @DBRef
    private List<MessageEntity> message;
    private boolean isActive;
}
