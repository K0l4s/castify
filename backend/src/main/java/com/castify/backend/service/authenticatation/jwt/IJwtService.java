package com.castify.backend.service.authenticatation.jwt;

import org.springframework.security.core.userdetails.UserDetails;

import java.util.Map;

public interface IJwtService {
    String extractUsername(String token);



    String generateToken(UserDetails userDetails);

    String generateToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails
    );


    String generateValidToken(String username);

    String generateValidToken(
            Map<String, Object> extraClaims,
            String username
    );

    String generateRefreshToken(
            UserDetails userDetails
    );

    boolean isTokenValid(String token, UserDetails userDetails);
    boolean isTokenValid(String token);
}
