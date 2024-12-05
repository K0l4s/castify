package com.castify.backend.controller;

import com.castify.backend.service.user.IUserService;
import com.castify.backend.service.user.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/v1/admin/user")
@RestController
public class AdminUserController {
    @Autowired
    private IUserService userService = new UserServiceImpl();
    @GetMapping("")
    private ResponseEntity<?> getAllUser(
            @RequestParam(value = "pageNumber") Integer pageNumber,
            @RequestParam(value="pageSize") Integer pageSize
    ) throws Exception {
        try{
            return ResponseEntity.ok(
                    userService.getAllUser(pageNumber,pageSize)
            );
        }
        catch (Exception ex){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error"+ex.getMessage());
        }
    }
    @PutMapping("/ban")
    private ResponseEntity<?> toggleBanAccount(
            @RequestParam(value="userId") String userId
    ) throws Exception {
        try{
            return ResponseEntity.ok(userService.toggleBanUser(userId));
        }
        catch (Exception ex){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error "+ex.getMessage());
        }
    }
}
