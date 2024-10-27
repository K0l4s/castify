package com.castify.apis.entity;

import com.castify.apis.enums.ConditionType;
import org.springframework.data.annotation.Id; // Sửa dòng này
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "condition")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ConditionEntity {
    @Id
    private String id;
    private ConditionType type;
    private int thresold;
    private int timePeriod;
}
