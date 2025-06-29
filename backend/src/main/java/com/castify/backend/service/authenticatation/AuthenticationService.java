package com.castify.backend.service.authenticatation;

import com.castify.backend.entity.PlaylistEntity;
import com.castify.backend.entity.TokenEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.entity.location.WardEntity;
import com.castify.backend.enums.PlaylistType;
import com.castify.backend.enums.Role;
import com.castify.backend.enums.TokenType;
import com.castify.backend.models.authentication.*;
import com.castify.backend.repository.PlaylistRepository;
import com.castify.backend.repository.WardRepository;
import com.castify.backend.service.email.EmailServiceImpl;
import com.castify.backend.service.email.IEmailService;
import com.castify.backend.service.authenticatation.jwt.IJwtService;
import com.castify.backend.service.authenticatation.jwt.JwtServiceImpl;
import com.castify.backend.service.playlist.IPlaylistService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

import com.castify.backend.repository.UserRepository;
import com.castify.backend.repository.TokenRepository;

@Service
@RequiredArgsConstructor
public class AuthenticationService implements IAuthenticationService {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationService.class);
    //    private final UserRepository repository;
//    private final TokenRepository tokenRepository;
//    private final PasswordEncoder passwordEncoder;
//    private final JwtServiceImpl jwtService;
//    private final AuthenticationManager authenticationManager;
    @Autowired
    private IJwtService jwtService;
    @Autowired
    private TokenRepository tokenRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private UserRepository repository;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private WardRepository wardRepository;
    @Autowired
    private IEmailService emailService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IPlaylistService playlistService;
    @Autowired
    private PlaylistRepository playlistRepository;

    @Override
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        var user = repository.findByEmailOrUsername(request.getEmail()).orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        revokeAllUserTokens(user);
        saveUserToken(user, jwtToken, TokenType.BEARER);

        Optional<PlaylistEntity> existing = playlistRepository.findByOwnerAndType(user, PlaylistType.WATCH_LATER);
        if (existing.isEmpty()) {
            playlistService.createDefaultWatchLaterPlaylist(user);
        }

        return AuthenticationResponse.builder().accessToken(jwtToken).refreshToken(refreshToken).build();
    }
    @Override
    public void revokeAllUserTokens(UserEntity userEntity) {
        var validUserTokens = tokenRepository.findAllValidTokenByUser(userEntity.getId());
        if (validUserTokens.isEmpty()) return;
        validUserTokens.forEach(token -> {
            token.setExpired(true);
            token.setRevoked(true);
        });
        tokenRepository.saveAll(validUserTokens);
    }
    @Override
    public void saveUserToken(UserEntity userEntity, String jwtToken, TokenType type) {
        if (type == null) {
            type = TokenType.BEARER; // Set default TokenType if not provided
        }

        TokenEntity token = TokenEntity.builder().userId(userEntity.getId()).token(jwtToken).tokenType(type).expired(false).revoked(false).build();

        tokenRepository.save(token);
    }
    private void checkRegisterValid(RegisterRequest request) throws Exception{
        if(!request.getEmail().equals(request.getRepeatEmail()))
            throw new RuntimeException("Email and repeat email not match!");
        if(!request.getPassword().equals(request.getConfirmPassword()))
            throw new RuntimeException("Password and confirm password not match!");
        if (userRepository.existsByEmailOrUsername(request.getEmail(), request.getUsername()))
            throw new RuntimeException("User with email " + request.getEmail() + " or nick name " + request.getEmail() + " already exists.");
    }
    @Override
    public RegisterResponse register(RegisterRequest request) throws Exception {
        System.out.println("Raw request: " + request);
        checkRegisterValid(request);
//        String code = this.getRandom();
//        System.out.println("IsMobile: " + request.isMobile());
        WardEntity selectedWard = wardRepository.findWardEntityById(request.getWardId());
        var user = UserEntity.builder()
//                .fullname(request.getFullname())
                .firstName(request.getFirstName()).lastName(request.getLastName()).middleName(request.getMiddleName()).email(request.getEmail()).password(passwordEncoder.encode(request.getPassword())).role(Role.USER)
//                .address(request.getAddress())
                .location(selectedWard)
                .provinces(request.getProvinces())
                .ward(request.getWard())
                .district(request.getDistrict())
                .locality(request.getAddressElements())
                .phone(request.getPhone()).birthday(request.getBirthday()).createdDay(LocalDateTime.now()).avatarUrl(null).coverUrl(null).isActive(false).username(request.getUsername()).isNonLocked(true).isNonBanned(true).build();

        var savedUser = repository.save(user);
        String validToken = jwtService.generateValidToken(request.getUsername());
        saveUserToken(savedUser, validToken, TokenType.VALID);
        emailService.sendVerificationMail(user.getEmail(), validToken, request.getAppType());

        // create watch later playlist
        playlistService.createDefaultWatchLaterPlaylist(user);
        return RegisterResponse.builder().firstName(savedUser.getFirstName()).lastName(savedUser.getLastName()).middleName(savedUser.getMiddleName()).email(savedUser.getEmail()).build();
    }

    @Override
    public AuthenticationResponse confirmUser(HttpServletRequest request, HttpServletResponse response) throws IOException {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        final String validToken;
        final String userEmail;
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IOException("Authenticate Error, please try again!");
        }
        validToken = authHeader.substring(7);
        userEmail = jwtService.extractUsername(validToken);
        if (userEmail == null) {
            throw new IOException("Not found user"+validToken);
        }
        var user = this.repository.findByEmailOrUsername(userEmail).orElseThrow();
        if (!jwtService.isTokenValid(validToken, user)) {
            throw new IOException(("Your token isn't valid"));
        }

        user.setActive(true);
        repository.save(user);

        revokeAllUserTokens(user);
        var accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        saveUserToken(user, accessToken, TokenType.BEARER);
        emailService.sendWelcomeMessage(user.getEmail(),user.getFullname());
        return AuthenticationResponse.builder().accessToken(accessToken).refreshToken(refreshToken).build();
    }
    @Override
    public void sendRequest(String email) throws IOException {
//        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
//
        var user = repository.findByEmailOrUsername(email).orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        revokeAllUserTokens(user);
        saveUserToken(user, jwtToken, TokenType.RESET_PASS);
        emailService.sendRefreshMessage(user.getEmail(), jwtToken);
//        return true;
//        return AuthenticationResponse.builder().accessToken(jwtToken).refreshToken(refreshToken).build();

    }
    @Override
    public AuthenticationResponse resetPassword(HttpServletRequest request, HttpServletResponse response, String newPassword) throws IOException {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        final String validToken;
        final String userEmail;
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IOException("Authenticate Error, please try again!");
        }
        validToken = authHeader.substring(7);
        userEmail = jwtService.extractUsername(validToken);
        if (userEmail == null) {
            throw new IOException("Not found user"+validToken);
        }
        var user = this.repository.findByEmailOrUsername(userEmail).orElseThrow();
        if (!jwtService.isTokenValid(validToken, user)) {
            throw new IOException(("Your token isn't valid"));
        }
        TokenEntity token = tokenRepository.findByToken(validToken).orElseThrow();
        if(token.isExpired()||token.isRevoked())
            throw new RuntimeException("Your token isn't valid!");
//        user.setActive(true);
        user.setPassword(passwordEncoder.encode(newPassword));
        repository.save(user);
        token.setExpired(true);
        token.setRevoked(true);
        tokenRepository.save(token);
//        revokeAllUserTokens(user);
        var accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        saveUserToken(user, accessToken, TokenType.BEARER);
        return AuthenticationResponse.builder().accessToken(accessToken).refreshToken(refreshToken).build();
    }
    @Override
    public AuthenticationResponse refreshToken(HttpServletRequest request, HttpServletResponse response) throws IOException {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        final String refreshToken;
        final String userEmail;
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IOException("Not authenticate");
        }
        refreshToken = authHeader.substring(7);
        userEmail = jwtService.extractUsername(refreshToken);
        if (userEmail == null) {
            throw new IOException("User not found");
        }
        var user = this.repository.findByEmailOrUsername(userEmail).orElseThrow();
        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new IOException("Token is not valid");
        }
        var accessToken = jwtService.generateToken(user);
        revokeAllUserTokens(user);
//                saveUserToken(user, accessToken, TokenType.BEARER);
//                var authResponse = AuthenticationResponse.builder().accessToken(accessToken).refreshToken(refreshToken).build();
//                new ObjectMapper().writeValue(response.getOutputStream(), authResponse);
        saveUserToken(user, accessToken, TokenType.BEARER);
        return AuthenticationResponse.builder().accessToken(accessToken).refreshToken(refreshToken).build();
    }
    @Override
    public void changePassword(HttpServletRequest request, HttpServletResponse response, ChangePssReq req) throws Exception {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        final String validToken;
        final String userEmail;
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IOException("Authenticate Error, please try again!");
        }
        validToken = authHeader.substring(7);
        userEmail = jwtService.extractUsername(validToken);
        if (userEmail == null) {
            throw new IOException("Not found user"+validToken);
        }
        var user = this.repository.findByEmailOrUsername(userEmail).orElseThrow();
        if (!jwtService.isTokenValid(validToken, user)) {
            throw new IOException(("Your token isn't valid"));
        }

        if (!passwordEncoder.matches(req.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Your old password is wrong!");

        }
        if(!req.getNewPassword().equals(req.getRepeatNewPassword()))
        {
            throw new RuntimeException("Your new password not match!");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

    }
}
