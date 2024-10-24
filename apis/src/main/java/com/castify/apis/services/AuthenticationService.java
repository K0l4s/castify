package com.castify.apis.services;

import com.castify.apis.collections.TokenCollection;
import com.castify.apis.collections.UserCollection;
import com.castify.apis.enums.Role;
import com.castify.apis.enums.TokenType;
import com.castify.apis.models.authentication.*;
import com.castify.apis.utils.EncryptionUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.Random;
import com.castify.apis.repositories.UserRepository;
import com.castify.apis.repositories.TokenRepository;
@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository repository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtServiceImpl jwtService;
    private final AuthenticationManager authenticationManager;

    @Autowired
    private IEmailService emailService = new EmailServiceImpl();

    @Autowired
    private UserRepository userRepository;
}
