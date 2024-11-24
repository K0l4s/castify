package com.castify.backend.controller;

import com.castify.backend.models.authentication.*;
import com.castify.backend.service.authenticatation.AuthenticationService;
import com.castify.backend.service.authenticatation.IAuthenticationService;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

//    private final AuthenticationService service;
    @Autowired
    private IAuthenticationService service = new AuthenticationService();
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request
    ) {
        try {
            return ResponseEntity.ok(service.register(request));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/authenticate")
    public ResponseEntity<?> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        try {
            return ResponseEntity.ok(service.authenticate(request));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: " + e.getMessage());
        }
    }
//@PostMapping("/authenticate")
//public ResponseEntity<?> authenticate(
//        @RequestBody AuthenticationRequest request,
//        HttpServletResponse response
//) {
//    try {
//        // Gọi service để thực hiện xác thực
//        AuthenticationResponse authResponse = service.authenticate(request);
//
//        // Tạo cookie
//        Cookie cookie = new Cookie("authToken", authResponse.getAccessToken());
//        cookie.setHttpOnly(true); // Chỉ truy cập cookie từ phía server
//        cookie.setSecure(true); // Sử dụng cho HTTPS
//        cookie.setPath("/"); // Có hiệu lực trên toàn bộ ứng dụng
//        cookie.setMaxAge( 24 * 60 * 60); // Cookie tồn tại trong 1 ngày
//
//        // Thêm cookie vào response
//        response.addCookie(cookie);
//        Cookie refeshTokenCookie = new Cookie("refreshAuthToken", authResponse.getRefreshToken());
//        refeshTokenCookie.setHttpOnly(true);
//        refeshTokenCookie.setSecure(true);
//        refeshTokenCookie.setPath("/");
//        refeshTokenCookie.setMaxAge( 7*24 * 60 * 60);
//        response.addCookie(cookie);
//
//        return ResponseEntity.ok(authResponse);
//    } catch (Exception e) {
//        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: " + e.getMessage());
//    }
//}

    @PostMapping("/vetify-email")
    public ResponseEntity<?> confirm(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        try {
            return ResponseEntity.ok(service.confirmUser(request,response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: " + e.getMessage());
        }
    }
    @PostMapping("/refresh-token")
    public  ResponseEntity<?> refreshTokenconfirm(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        try {
            return ResponseEntity.ok(service.refreshToken(request,response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: " + e.getMessage());
        }
    }
    @ExceptionHandler(MalformedJwtException.class)
    public ResponseEntity<String> handleMalformedJwtException(MalformedJwtException ex) {
        return new ResponseEntity<>("Invalid JWT token format", HttpStatus.BAD_REQUEST);
    }

}
