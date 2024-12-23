package com.castify.backend.config;

import com.castify.backend.utils.JwtUtil;
import com.castify.backend.utils.SocketJwtAuthenticationToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthentication;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationProvider;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
public class WebSocketAuthenticator {
    private final JwtUtil jwtUtil;

    public WebSocketAuthenticator(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    public SocketJwtAuthenticationToken getAuthenticatedOrFail(final String bearerToken) throws AuthenticationException {
        if (!(bearerToken != null && bearerToken.startsWith("Bearer "))) {
            throw new JwtException("Bearer token is missing or invalid");
        }
        final String token = bearerToken.substring(7);

        return jwtUtil.validateToken(token);
    }
}
