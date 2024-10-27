package com.castify.apis.service;

import com.castify.apis.models.authentication.AuthenticationRequest;
import com.castify.apis.models.authentication.AuthenticationResponse;
import com.castify.apis.models.authentication.RegisterRequest;
import com.castify.apis.models.authentication.RegisterResponse;

public interface IAuthenticationService {
    AuthenticationResponse authenticate(AuthenticationRequest request);

    RegisterResponse register(RegisterRequest request) throws Exception;
}
