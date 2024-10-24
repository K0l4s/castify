package com.castify.apis.collections;

import jakarta.persistence.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "message")
public class MessageCollection {
    @Id
    private String id;

    @DBRef
    private UserCollection sender;

    @DBRef
    private UserCollection receiver;

    private String content;

    private LocalDateTime timestamp;
}
