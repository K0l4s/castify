package com.castify.backend.service;

import com.castify.backend.models.authentication.AuthenticationRequest;
import com.castify.backend.models.authentication.AuthenticationResponse;
import com.castify.backend.models.authentication.RegisterRequest;
import com.castify.backend.models.authentication.RegisterResponse;
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

    //    public void
    AuthenticationResponse refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException;
}
