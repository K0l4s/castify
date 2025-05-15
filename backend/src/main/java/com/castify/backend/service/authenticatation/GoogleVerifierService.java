package com.castify.backend.service.authenticatation;

import com.castify.backend.controller.ConversationController;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.enums.Role;
import com.castify.backend.enums.TokenType;
import com.castify.backend.models.authentication.AuthenticationResponse;
import com.castify.backend.repository.UserRepository;
import com.castify.backend.service.authenticatation.jwt.IJwtService;
import com.castify.backend.service.user.IUserService;
import com.castify.backend.utils.RandomUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.google.api.client.json.jackson2.JacksonFactory;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.logging.Logger;

@Service
public class GoogleVerifierService implements IGoogleVertifier{
    @Value("${GOOGLE_OAUTH2_CLIENT_ID}")
    private String CLIENT_ID;
//    private static final Logger logger = Logger.getLogger(GoogleVerifierService.class.getName());

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
    private GoogleIdTokenVerifier verifier;

    @PostConstruct
    public void initVerifier() {
        try {
            this.verifier = new GoogleIdTokenVerifier.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    JacksonFactory.getDefaultInstance()
            )
                    .setAudience(Collections.singletonList(CLIENT_ID))
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize GoogleIdTokenVerifier", e);
        }
    }

    @Override
    public GoogleIdToken.Payload verify(String idTokenString) {
        try {
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
            userEntity.setPassword(passwordEncoder.encode(RandomUtil.generateRandomString()));
            userEntity.setFirstName("Name");
            userEntity.setLastName("User");
            userEntity.setLastName("Castify");
            userEntity.setAvatarUrl("https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740");
            userEntity.setRole(Role.USER);
            userEntity.setActive(true);
            userEntity.setNonBanned(true);
            userEntity.setNonLocked(true);
            userEntity.setUsername(user.getEmail());
            userEntity.setCreatedDay(LocalDateTime.now());
            userRepository.save(userEntity);
        }
        var newUser = userRepository.findByEmailOrUsername(email).orElseThrow();
//        logger.info(newUser.getEmail());
        var jwtToken = jwtService.generateToken(newUser);
        var refreshToken = jwtService.generateRefreshToken(newUser);
        authenticationService.revokeAllUserTokens(newUser);
        authenticationService.saveUserToken(newUser, jwtToken, TokenType.BEARER);
        return AuthenticationResponse.builder().accessToken(jwtToken).refreshToken(refreshToken).build();
    }

}
