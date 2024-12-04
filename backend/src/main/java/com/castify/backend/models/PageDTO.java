package com.castify.backend.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PageDTO<T> {
    private List<T> content;
    private int size;
    private int currentPage;
    private int totalPages;
    private long totalElements;

    public PageDTO(List<T> content, int currentPage, int totalPages, int totalElements) {
        this.content = content;
        this.currentPage = currentPage;
        this.totalPages = totalPages;
        this.totalElements = totalElements;
    }
}