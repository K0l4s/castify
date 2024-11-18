package com.castify.backend.controller;

import com.castify.backend.models.user.UserModel;
import com.castify.backend.service.IUserService;
import com.castify.backend.service.UserServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
                        .ok(userService.getUserByUsername(username));

            return ResponseEntity
                    .ok(userService.getUserByToken());
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Error: " + e.getMessage());
        }
    }


}
