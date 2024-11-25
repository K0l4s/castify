package com.castify.backend.service.comment;

import com.castify.backend.entity.UserEntity;
import com.castify.backend.models.PageDTO;
import com.castify.backend.models.comment.CommentModel;
import com.castify.backend.models.comment.CommentRequestDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ICommentService {
    CommentModel addComment(UserEntity user, CommentRequestDTO commentRequestDTO);
    PageDTO<CommentModel> getPodcastComments(String id, int page, int size, String sortBy);
    String toggleLikeOnComment(String id) throws Exception;
}
