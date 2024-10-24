package com.castify.apis.collections;

import jakarta.persistence.Id;
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
public class ChatCollection {
    @Id
    private String id;
    private String title;
    private String imageUrl;

    @DBRef
    private List<UserCollection> member;

    @DBRef
    private List<MessageCollection> message;
    private boolean isActive;
}
