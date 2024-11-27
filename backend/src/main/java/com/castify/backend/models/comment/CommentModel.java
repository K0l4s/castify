package com.castify.backend.models.comment;

import com.castify.backend.models.user.UserSimple;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CommentModel {
    private String id;
    private String parentId;
    private String content;
    private String mentionedUser;
    private long totalLikes;
    private long totalReplies;
    private LocalDateTime timestamp;

    private boolean isLiked;
    private UserSimple user;
}
