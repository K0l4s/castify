package com.castify.backend.entity.location;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "city")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class CityEntity {
    @Id
    private String id;
    private String name;
}
