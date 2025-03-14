package com.castify.backend.entity.location;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "ward")
@NoArgsConstructor
@AllArgsConstructor
public class WardEntity {
    @Id
    private String id;
    private String name;
    @DBRef
    private DistrictEntity district;
    private String type;
    private String typeText;
}
