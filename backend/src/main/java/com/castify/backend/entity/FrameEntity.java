package com.castify.backend.entity;

import com.castify.backend.enums.FrameStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "frame")
@NoArgsConstructor
@AllArgsConstructor
@Data

public class FrameEntity {
    @Id
    private String id;

    private String name;
    private FrameStatus status;

    private String imageURL;

    @DBRef (lazy = true)
    private UserEntity user;

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime lastEditedAt;
}


