package com.castify.backend.models.comment;

import com.castify.backend.models.user.UserSimple;
import com.fasterxml.jackson.annotation.JsonFormat;
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
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime timestamp;

    private boolean isLiked;
    private UserSimple user;
}
