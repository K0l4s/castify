package com.castify.backend.controller;

import com.castify.backend.models.authentication.*;
import com.castify.backend.service.authenticatation.AuthenticationService;
import com.castify.backend.service.authenticatation.GoogleVerifierService;
import com.castify.backend.service.authenticatation.IAuthenticationService;
import com.castify.backend.service.authenticatation.jwt.IJwtService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import static com.cloudinary.AccessControlRule.AccessType.token;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    @Autowired
    private GoogleVerifierService googleVerifierService;
    //    private final AuthenticationService service;
    @Autowired
    private IAuthenticationService service = new AuthenticationService();

    @Autowired
    private IJwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request
    ) {
        try {
            System.out.println("Request controller: " + request);
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

    @PostMapping("/verify-email")
    public ResponseEntity<?> confirm(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        try {
            return ResponseEntity.ok(service.confirmUser(request, response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshTokenconfirm(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        try {
            return ResponseEntity.ok(service.refreshToken(request, response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: " + e.getMessage());
        }
    }

    @ExceptionHandler(MalformedJwtException.class)
    public ResponseEntity<String> handleMalformedJwtException(MalformedJwtException ex) {
        return new ResponseEntity<>("Invalid JWT token format", HttpStatus.BAD_REQUEST);
    }

    @PostMapping("/reset/send-request")
    public ResponseEntity<?> sendRequest(@RequestParam String email) {
        try {
            service.sendRequest(email);
            return ResponseEntity.ok("Send completed!");
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: " + ex.getMessage());
        }
    }

    @PostMapping("/reset/change")
    public ResponseEntity<?> resetPassword(
            HttpServletRequest request,
            HttpServletResponse response,
            @RequestParam String newPassword
    ) {
        try {
            return ResponseEntity.ok(service.resetPassword(request, response,newPassword));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: " + e.getMessage());
        }
    }

    // Check if access token is valid ?
    @PostMapping("/check-token")
    public ResponseEntity<?> checkToken(@RequestParam(value = "token") String token) {
        boolean isValid = jwtService.isTokenValid(token);
        return ResponseEntity.ok(Map.of("valid", isValid));
    }

    @PostMapping("/password")
    public ResponseEntity<?> changePassword(
            HttpServletRequest request,
            HttpServletResponse response,
            @RequestBody ChangePssReq changePsw
    ){

        try {
            service.changePassword(request,response,changePsw);
            return ResponseEntity.ok("OK!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        GoogleIdToken.Payload userInfo = googleVerifierService.verify(token);
        if (userInfo == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        return ResponseEntity.ok(googleVerifierService.authWithGoogle(userInfo));
//
//        String email = userInfo.getEmail();
//        String name = (String) userInfo.get("name");
//        String picture = (String) userInfo.get("picture");
//
//        // TODO: Lookup user in DB, or create if not exist
//        // Return your own JWT
////        String appToken = generateAppJwt(email);
//
//        return ResponseEntity.ok(Map.of("accessToken", appToken));
    }

}
