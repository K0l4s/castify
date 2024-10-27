package com.castify.backend.service;

import com.castify.backend.models.authentication.AuthenticationRequest;
import com.castify.backend.models.authentication.AuthenticationResponse;
import com.castify.backend.models.authentication.RegisterRequest;
import com.castify.backend.models.authentication.RegisterResponse;

public interface IAuthenticationService {
    AuthenticationResponse authenticate(AuthenticationRequest request);

    RegisterResponse register(RegisterRequest request) throws Exception;
}
