package com.castify.backend.entity;

import com.castify.backend.models.conversation.MemberInfor;
import org.springframework.data.annotation.Id; // Sửa dòng này
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
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
    private String name;

//    @DBRef
    private List<MemberInfor> memberList;
    @DBRef
    private List<MessageEntity> message;
    private boolean isActive;
    private LocalDateTime createdAt;
}

