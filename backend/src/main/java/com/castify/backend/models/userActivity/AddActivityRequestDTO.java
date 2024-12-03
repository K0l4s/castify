package com.castify.backend.models.userActivity;

import com.castify.backend.enums.ActivityType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AddActivityRequestDTO {
    private ActivityType type;
    private String podcastId;
    private String commentId;
}
