package com.castify.backend.entity.location;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "district")
@AllArgsConstructor
@NoArgsConstructor
public class DistrictEntity {
    @Id
    private String id;
    @DBRef
    private CityEntity city;
    private String name;
    private int type;
    private String typeText;
}
