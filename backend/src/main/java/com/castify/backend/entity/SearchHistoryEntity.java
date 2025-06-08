package com.castify.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
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
    private LocalDateTime lastSearched = LocalDateTime.now();
    private Integer searchCount = 1; // Đếm số lần search keyword này

    @Indexed
    private String normalizedKeyword;

    public SearchHistoryEntity(String userId, String keyword, String normalizedKeyword) {
        this.userId = userId;
        this.keyword = keyword;
        this.normalizedKeyword = normalizedKeyword;
        this.timeStamp = LocalDateTime.now();
        this.lastSearched = LocalDateTime.now();
        this.searchCount = 1;
    }

    public void incrementSearchCount() {
        this.searchCount++;
        this.lastSearched = LocalDateTime.now();
    }
}
