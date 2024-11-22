package com.castify.backend.service.comment;

import com.castify.backend.entity.UserEntity;
import com.castify.backend.models.comment.CommentModel;
import com.castify.backend.models.comment.CommentRequestDTO;

import java.util.List;

public interface ICommentService {
    CommentModel addComment(UserEntity user, CommentRequestDTO commentRequestDTO);
    List<CommentModel> getPodcastComments(String id);
}
