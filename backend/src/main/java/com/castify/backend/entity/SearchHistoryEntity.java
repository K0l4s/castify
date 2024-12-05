package com.castify.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "searchHistory")
public class SearchHistoryEntity {
    @Id
    private String id;
    private String userId;
    private String keyword;
    private LocalDateTime timeStamp = LocalDateTime.now();
}
