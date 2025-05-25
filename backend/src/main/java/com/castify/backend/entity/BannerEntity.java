package com.castify.backend.entity;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "banner")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class BannerEntity {
    @Id
    private String id;

    private String imageUrl;
    private String linkTo;

    private String buttonText;
}
