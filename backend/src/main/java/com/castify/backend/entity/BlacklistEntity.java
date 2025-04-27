package com.castify.backend.entity;

import com.castify.backend.models.blacklist.PosModel;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "blacklist")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class BlacklistEntity {
    @Id
    private String id;

    private String value;

    private int label;

    private int type;

    private List<PosModel> pos = new ArrayList<>();
}
