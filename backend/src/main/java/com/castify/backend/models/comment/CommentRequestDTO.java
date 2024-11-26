package com.castify.backend.models.comment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentRequestDTO {
    private String podcastId;
    private String parentId;
    private String mentionedUser;
    private String content;
}
