package com.castify.apis.collections;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "badge")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class BadgeCollection {
    @Id
    private String id;
    private String name;
}
