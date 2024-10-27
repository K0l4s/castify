package com.castify.apis.service;

import com.castify.apis.entity.TokenEntity;
import com.castify.apis.entity.UserEntity;
import com.castify.apis.enums.Role;
import com.castify.apis.enums.TokenType;
import com.castify.apis.models.authentication.*;
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

import java.io.IOException;
import java.time.LocalDateTime;

import com.castify.apis.repository.UserRepository;
import com.castify.apis.repository.TokenRepository;
@Service
@RequiredArgsConstructor
public class AuthenticationService implements IAuthenticationService{
    private final UserRepository repository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtServiceImpl jwtService;
    private final AuthenticationManager authenticationManager;

    @Autowired
    private IEmailService emailService = new EmailServiceImpl();

    @Autowired
    private UserRepository userRepository;
    @Override
    public  AuthenticationResponse authenticate(AuthenticationRequest request){
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = repository.findByEmailOrUsername(request.getEmail())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        revokeAllUserTokens(user);
        saveUserToken(user, jwtToken,TokenType.BEARER);
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }
    private void revokeAllUserTokens(UserEntity userEntity) {
        var validUserTokens = tokenRepository.findAllValidTokenByUser(userEntity.getId());
        if (validUserTokens.isEmpty())
            return;
        validUserTokens.forEach(token -> {
            token.setExpired(true);
            token.setRevoked(true);
        });
        tokenRepository.saveAll(validUserTokens);
    }

    private void saveUserToken(UserEntity userEntity, String jwtToken, TokenType type) {
        if (type == null) {
            type = TokenType.BEARER; // Set default TokenType if not provided
        }

        TokenEntity token = TokenEntity.builder()
                .userId(userEntity.getId())
                .token(jwtToken)
                .tokenType(type)
                .expired(false)
                .revoked(false)
                .build();

        tokenRepository.save(token);
    }

    @Override
    public RegisterResponse register(RegisterRequest request) throws Exception {
        if(userRepository.existsByEmailOrUsername(request.getEmail(),request.getUsername()))
            throw new RuntimeException("User with email " + request.getEmail() +" or nick name "+request.getEmail()+ " already exists.");

//        String code = this.getRandom();

        var user = UserEntity.builder()
//                .fullname(request.getFullname())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .middleName(request.getMiddleName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .address(request.getAddress())
                .phone(request.getPhone())
                .birthday(request.getBirthday())
                .createdDay(LocalDateTime.now())
                .avatarUrl(null)
                .coverUrl(null)
                .isActive(false)
                .username(request.getUsername())
                .isNonLocked(true)
                .isNonBanned(true)
                .build();


        var savedUser = repository.save(user);
        String validToken = jwtService.generateToken(user);
        saveUserToken(user,validToken,TokenType.VALID);
        emailService.sendVerificationMail(user.getEmail(),validToken);
        return RegisterResponse.builder()
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .middleName(savedUser.getMiddleName())
                .email(savedUser.getEmail())
                .build();
    }
    public void refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        final String refreshToken;
        final String userEmail;
        if (authHeader == null ||!authHeader.startsWith("Bearer ")) {
            return;
        }
        refreshToken = authHeader.substring(7);
        userEmail = jwtService.extractUsername(refreshToken);
        if (userEmail != null) {
            var user = this.repository.findByEmailOrUsername(userEmail)
                    .orElseThrow();
            if (jwtService.isTokenValid(refreshToken, user)) {
                var accessToken = jwtService.generateToken(user);
                revokeAllUserTokens(user);
                saveUserToken(user, accessToken,TokenType.BEARER);
                var authResponse = AuthenticationResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .build();
                new ObjectMapper().writeValue(response.getOutputStream(), authResponse);
            }
        }
    }
}
