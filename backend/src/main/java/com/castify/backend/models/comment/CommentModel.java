package com.castify.backend.models.comment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CommentModel {
    private String id;
    private String content;
    private long totalLikes;
    private long totalReplies;
    private LocalDateTime timestamp;

    private boolean isLiked;
}
