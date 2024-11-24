package com.castify.backend.controller;

import com.castify.backend.models.user.UpdateUserModel;
import com.castify.backend.models.user.UserModel;
import com.castify.backend.service.uploadFile.IUploadFileService;
import com.castify.backend.service.uploadFile.UploadFileServiceImpl;
import com.castify.backend.service.user.IUserService;
import com.castify.backend.service.user.UserServiceImpl;
import io.jsonwebtoken.MalformedJwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {
    @Autowired
    private IUserService userService = new UserServiceImpl();
    @GetMapping("")
    private ResponseEntity<?> getUserByUsername(
            @RequestParam(value = "username", required = false) String username) {
        try {

//            UserModel user = new UserModel();
            if (username != null)
                return ResponseEntity
                        .ok(userService.getProfileDetail(username));

            return ResponseEntity
                    .ok(userService.getSelfProfileDetail());
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Error: " + e.getMessage());
        }
    }
    @GetMapping("/auth")
    private ResponseEntity<?> getUserAuth() {
        try {
            return ResponseEntity
                    .ok(userService.getUserByToken());
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Error: " + e.getMessage());
        }
    }
    @PutMapping("/image")
    private ResponseEntity<String> updateAvatar(
            @RequestPart("avatar") MultipartFile avatarFile
            )
    {
        try{
            return ResponseEntity.ok(
                    userService.updateAvatar(avatarFile)
            );

        }catch (Exception e){
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Error"+e.getMessage());
        }
    }

    @PutMapping("")
    private ResponseEntity<?> updateInformationByToken(
            @RequestBody UpdateUserModel updateUserModel
            ) throws Exception {
        try{
            return ResponseEntity.ok(
                    userService.updateUserInformationById(updateUserModel)
            );
        }catch (Exception ex){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error"+ ex.getMessage());
        }
    }

    @PutMapping("/follow")
    private ResponseEntity<?> toggleFollow(
            @RequestParam(value = "username") String username
    ) throws Exception{
        try{
            return ResponseEntity.ok(
                    userService.toggleFollow(username)
            );
        }catch (Exception ex){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error"+ex.getMessage());
        }
    }
    @ExceptionHandler(MalformedJwtException.class)
    public ResponseEntity<String> handleMalformedJwtException(MalformedJwtException ex) {
        return new ResponseEntity<>("Invalid JWT token format", HttpStatus.BAD_REQUEST);
    }


}
