package com.castify.backend.models.userActivity;

import com.castify.backend.enums.ActivityType;
import com.castify.backend.models.comment.CommentModel;
import com.castify.backend.models.podcast.PodcastModel;
import com.castify.backend.models.user.UserSimple;
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
    private LocalDateTime timestamp;
}
