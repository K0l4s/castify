package com.castify.backend.service.authenticatation;

import com.castify.backend.models.authentication.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

public interface IAuthenticationService {
    AuthenticationResponse authenticate(AuthenticationRequest request);

    RegisterResponse register(RegisterRequest request) throws Exception;

    AuthenticationResponse confirmUser(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException;

    void sendRequest(ResetPasswordRequest request) throws IOException;

    AuthenticationResponse resetPassword(HttpServletRequest request, HttpServletResponse response, String newPassword) throws IOException;

    //    public void
    AuthenticationResponse refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException;
}
