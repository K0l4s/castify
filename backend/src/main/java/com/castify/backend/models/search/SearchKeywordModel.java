package com.castify.backend.models.search;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SearchKeywordModel {
    private String keyword;
    private int searchCount;

    public SearchKeywordModel(String keyword) {
        this.keyword = keyword;
        this.searchCount = 1;
    }
}