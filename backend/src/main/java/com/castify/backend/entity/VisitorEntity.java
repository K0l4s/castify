package com.castify.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

//@Entity
@Data
@Document(collection = "visitor")
@NoArgsConstructor
@AllArgsConstructor
public class VisitorEntity {
    @Id
    private String id;
    private String userAgent;
    private String url;
    private LocalDateTime accessTime = LocalDateTime.now();
}
