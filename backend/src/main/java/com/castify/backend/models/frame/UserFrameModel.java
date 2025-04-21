package com.castify.backend.models.frame;

import com.castify.backend.enums.FrameStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserFrameModel {
    private String id;
    private String name;
    private String imageURL;
    private Integer price;
}
