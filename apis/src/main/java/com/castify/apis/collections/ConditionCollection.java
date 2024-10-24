package com.castify.apis.collections;

import com.castify.apis.enums.ConditionType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "condition")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ConditionCollection {
    @Id
    private String id;
    private ConditionType type;
    private int thresold;
    private int timePeriod;
}
