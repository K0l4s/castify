package com.castify.backend.models.location;

import com.castify.backend.entity.location.WardEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.DBRef;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LocationModel {
    @DBRef
    private WardEntity wardEntity;
    private String location;
}
