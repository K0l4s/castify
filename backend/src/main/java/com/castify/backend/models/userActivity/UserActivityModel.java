package com.castify.backend.models.userActivity;

import com.castify.backend.enums.ActivityType;
import com.castify.backend.models.comment.CommentModel;
import com.castify.backend.models.podcast.PodcastModel;
import com.castify.backend.models.user.UserSimple;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserActivityModel {
    private String id;
    private ActivityType type;
    private PodcastModel podcast;
    private CommentModel comment;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime timestamp;
}
