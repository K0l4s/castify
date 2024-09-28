package com.castify.apis.controllers;

import com.castify.apis.models.*;
import com.castify.apis.models.authentication.*;
import com.castify.apis.services.AuthenticationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @RequestBody RegisterRequest request
    ) throws Exception {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/confirm-email")
    public ResponseEntity<AuthenticationResponse> confirm(@RequestBody ConfirmRequest confirmRequest) throws Exception {
        return ResponseEntity.ok(service.confirmRegister(confirmRequest));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        return ResponseEntity.ok(service.authenticate(request));
    }

//    @PostMapping("/oauth2/login")
//    public ResponseEntity<AuthenticationResponse> loginWithGoogleOauth2(@RequestBody GoogleLoginRequest requestBody) {
//        return ResponseEntity.ok(service.loginOAuthGoogle(requestBody));
//    }

    @PostMapping("/refresh-token")
    public void refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        service.refreshToken(request, response);
    }

//  @PatchMapping("/code/{email}")
//  public ResponseEntity<String> sendCode(
//          @PathVariable("email") String email
//  ){
//    return ResponseEntity.ok(service.sendCodeToUser(email));
//  }
}
