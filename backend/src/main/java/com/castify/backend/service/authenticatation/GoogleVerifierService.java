package com.castify.backend.service.authenticatation;

import com.castify.backend.entity.UserEntity;
import com.castify.backend.enums.Role;
import com.castify.backend.enums.TokenType;
import com.castify.backend.models.authentication.AuthenticationResponse;
import com.castify.backend.repository.UserRepository;
import com.castify.backend.service.authenticatation.jwt.IJwtService;
import com.castify.backend.service.user.IUserService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.google.api.client.json.jackson2.JacksonFactory;

import java.util.Collections;

@Service
public class GoogleVerifierService implements IGoogleVertifier{
    @Value("${GOOGLE_OAUTH2_CLIENT_ID}")
    private String CLIENT_ID;
    @Autowired
    private IUserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private IAuthenticationService authenticationService;
    @Autowired
    private IJwtService jwtService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Override
    public GoogleIdToken.Payload verify(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier
                    .Builder(GoogleNetHttpTransport.newTrustedTransport(), JacksonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(CLIENT_ID))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                return idToken.getPayload();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
    @Override
    public AuthenticationResponse authWithGoogle(GoogleIdToken.Payload user) {
        String email = user.getEmail();
        var currentUsers = userRepository.findByEmail(email);
        if(currentUsers.isEmpty()) {
            UserEntity userEntity = new UserEntity();
            userEntity.setEmail(user.getEmail());
            userEntity.setPassword(passwordEncoder.encode(user.getEmail()));
            userEntity.setFirstName(user.getEmail());
            userEntity.setRole(Role.USER);
            userRepository.save(userEntity);
//            currentUsers = userRepository.findByEmail(email);
        }
        var newUser = userRepository.findByEmailOrUsername(email).orElseThrow();
        var jwtToken = jwtService.generateToken(newUser);
        var refreshToken = jwtService.generateRefreshToken(newUser);
        authenticationService.revokeAllUserTokens(newUser);
        authenticationService.saveUserToken(newUser, jwtToken, TokenType.BEARER);
        return AuthenticationResponse.builder().accessToken(jwtToken).refreshToken(refreshToken).build();
    }
}
