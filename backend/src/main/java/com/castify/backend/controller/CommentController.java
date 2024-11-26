package com.castify.backend.controller;

import com.castify.backend.entity.UserEntity;
import com.castify.backend.models.PageDTO;
import com.castify.backend.models.comment.LikeCommentDTO;
import com.castify.backend.models.comment.CommentRequestDTO;
import com.castify.backend.models.comment.CommentModel;
import com.castify.backend.service.comment.ICommentService;
import com.castify.backend.service.user.IUserService;
import io.jsonwebtoken.MalformedJwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<PageDTO<CommentModel>> getComments(@PathVariable String id,
                                                          @RequestParam(defaultValue = "0") int page,
                                                          @RequestParam(defaultValue = "10") int size,
                                                          @RequestParam(defaultValue = "latest") String sortBy) {
        try {
            PageDTO<CommentModel> commentModels = commentService.getPodcastComments(id, page, size, sortBy);
            return new ResponseEntity<>(commentModels, HttpStatus.OK);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    @ExceptionHandler(MalformedJwtException.class)
    public ResponseEntity<String> handleMalformedJwtException(MalformedJwtException ex) {
        return new ResponseEntity<>("Invalid JWT token format", HttpStatus.BAD_REQUEST);
    }

    @PostMapping("/reaction")
    public ResponseEntity<?> toggleLikeOnComments(@RequestBody LikeCommentDTO likeCommentDTO) {
        try {
            boolean res = commentService.toggleLikeOnComment(likeCommentDTO.getCommentId());
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }
}
