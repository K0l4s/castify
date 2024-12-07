package com.castify.backend.controller;

import com.castify.backend.entity.UserEntity;
import com.castify.backend.enums.Role;
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
            CommentModel commentModel = commentService.addComment(commentRequestDTO);
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

    @GetMapping("/list/replies/{id}")
    public ResponseEntity<?> getReplies(@PathVariable String id) {
        try {
            List<CommentModel> replies = commentService.getReplies(id);
            return new ResponseEntity<>(replies, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }
    @GetMapping("/detail")
    private ResponseEntity<?> getUserByUserId(
            @RequestParam("commentId") String commentId
    ) throws Exception {
        try{
            return ResponseEntity.ok(
                    commentService.getById(commentId)
            );
        }
        catch (Exception ex){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error"+ex.getMessage());
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteComments(@RequestBody List<String> commentIds) {
        try {
            UserEntity currentUser = userService.getUserByAuthentication();

            // Kiem tra quyen admin
            boolean isAdmin = currentUser.getRole() == Role.ADMIN;

            commentService.deleteCommentsByIds(commentIds, isAdmin);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
