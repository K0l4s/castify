package com.castify.backend.models.frame;

import com.castify.backend.entity.UserEntity;
import com.castify.backend.enums.FrameStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FrameModel {
    private String id;
    private String name;
    private FrameStatus status;
    private String imageURL;
    private Integer price;
    private boolean isBuy;
//    private UserEntity user;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime lastEditedAt;
}
