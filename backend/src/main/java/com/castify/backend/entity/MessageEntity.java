package com.castify.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.data.annotation.Id; // Sửa dòng này
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "message")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class MessageEntity {
    @Id
    private String id;
    private String chatId;
    @DBRef
    private UserEntity sender;

    private List<String> seenUsers = new ArrayList<>();

//    @DBRef
//    private UserEntity receiver;

    private String content;
    private LocalDateTime timestamp = LocalDateTime.now();
    private boolean isSeen(String userId){
        return seenUsers.contains(userId);
    }
}
