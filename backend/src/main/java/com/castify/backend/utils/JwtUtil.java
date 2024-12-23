package com.castify.backend.utils;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtUtil {
    @Value("${application.security.jwt.secret-key}")
    private String jwtKey;

    public String getUsernameFromToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtKey));
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();
    }

    public List<String> getAuthoritiesFromToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtKey));
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().get("authorities", List.class);
    }

    public SocketJwtAuthenticationToken validateToken(String token) {
        try {
            String principal = getUsernameFromToken(token);
            List<String> authorities = (List<String>) getAuthoritiesFromToken(token);
            return new SocketJwtAuthenticationToken(principal, authorities.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList()));
        } catch (JwtException | IllegalArgumentException e) {
            throw new org.springframework.security.oauth2.jwt.JwtException("Jwt token is invalid");
        }
    }
}
