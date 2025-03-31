package com.castify.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "userFrame")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class UserFrameEntity {
    @Id
    private String id;

    @DBRef (lazy = true)
    private UserEntity user;

    private List<String> frames = new ArrayList<>();

    private LocalDateTime purchasedAt;

    public void addFrame (FrameEntity frame) {
        frames.add(frame.getId());
    }
}
