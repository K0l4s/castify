package com.castify.backend.models;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class PageDTO<T> {
    private List<T> content;
    private int size;
    private int currentPage;
    private int totalPage;
    private long totalElements;
}