package com.castify.backend.service.authenticatation;

import com.castify.backend.entity.UserEntity;
import com.castify.backend.enums.TokenType;
import com.castify.backend.models.authentication.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

public interface IAuthenticationService {
    AuthenticationResponse authenticate(AuthenticationRequest request);

    void revokeAllUserTokens(UserEntity userEntity);

    void saveUserToken(UserEntity userEntity, String jwtToken, TokenType type);

    RegisterResponse register(RegisterRequest request) throws Exception;

    AuthenticationResponse confirmUser(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException;

    void sendRequest(String email) throws IOException;

    AuthenticationResponse resetPassword(HttpServletRequest request, HttpServletResponse response, String newPassword) throws IOException;

    //    public void
    AuthenticationResponse refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException;

    void changePassword(HttpServletRequest request, HttpServletResponse response, ChangePssReq req) throws Exception;
}
