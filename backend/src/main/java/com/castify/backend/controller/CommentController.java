package com.castify.backend.controller;

import com.castify.backend.entity.UserEntity;
import com.castify.backend.models.comment.CommentRequestDTO;
import com.castify.backend.models.comment.CommentModel;
import com.castify.backend.service.comment.ICommentService;
import com.castify.backend.service.user.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/comment")
public class CommentController {
    @Autowired
    private ICommentService commentService;

    @Autowired
    private IUserService userService;

    @PostMapping("/add")
    public ResponseEntity<CommentModel> addComment(@RequestBody CommentRequestDTO commentRequestDTO) {
        try {
            UserEntity user = userService.getUserByAuthentication();
            CommentModel commentModel = commentService.addComment(user, commentRequestDTO);
            return new ResponseEntity<>(commentModel, HttpStatus.CREATED);
        } catch (Exception exception) {
            System.out.println(exception.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/list/{id}")
    public ResponseEntity<List<CommentModel>> getComments(@PathVariable String id) {
        try {
            List<CommentModel> commentModels = commentService.getPodcastComments(id);
            return new ResponseEntity<>(commentModels, HttpStatus.OK);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}
