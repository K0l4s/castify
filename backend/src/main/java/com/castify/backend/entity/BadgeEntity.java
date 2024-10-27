package com.castify.backend.entity;

import org.springframework.data.annotation.Id; // Sửa dòng này
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "badge")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class BadgeEntity {
    @Id
    private String id;
    private String name;
    private List<String> conditionsId;
}
