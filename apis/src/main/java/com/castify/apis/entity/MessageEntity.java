package com.castify.apis.entity;

import org.springframework.data.annotation.Id; // Sửa dòng này
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "message")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class MessageEntity {
    @Id
    private String id;

    @DBRef
    private UserEntity sender;

    @DBRef
    private UserEntity receiver;

    private String content;

    private LocalDateTime timestamp;
}
