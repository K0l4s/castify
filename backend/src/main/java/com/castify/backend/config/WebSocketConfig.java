package com.castify.backend.config;

import com.castify.backend.controller.PaymentController;
import com.castify.backend.service.authenticatation.jwt.IJwtService;
import com.castify.backend.service.authenticatation.jwt.JwtServiceImpl;
import com.castify.backend.utils.SocketJwtAuthenticationToken;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtServiceImpl jwtService; // Dùng JwtService của mày
    private final UserDetailsService userDetailsService;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
//                .setAllowedOriginPatterns("http://localhost:5000", "https://castifyapp.vercel.app", "http://10.0.2.2:8081")
                .withSockJS();
    }
    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(128 * 1024);
        registration.setSendBufferSizeLimit(512 * 1024);
        registration.setSendTimeLimit(20000);
    }

    private static final Logger logger = Logger.getLogger(WebSocketConfig.class.getName());

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        try {
                            // Trích xuất email từ JWT
                            String userEmail = jwtService.extractUsername(token);
                            if (userEmail != null) {
                                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
                                if (jwtService.isTokenValid(token, userDetails)) {
                                    UsernamePasswordAuthenticationToken authentication =
                                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                                    SecurityContextHolder.getContext().setAuthentication(authentication);
                                    accessor.setUser(authentication);
                                    logger.info("✅ WebSocket Authentication successful for user: " + userEmail);
                                }
                            }
                        } catch (Exception e) {
                            logger.info("❌ WebSocket Authentication failed: " + e.getMessage());
                            throw new IllegalArgumentException("Invalid token: " + e.getMessage());
                        }
                    } else {
                        throw new IllegalArgumentException("❌ Missing or invalid Authorization header");
                    }
                }
                return message;
            }
        });
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue", "/user","/msg");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Bean
    public AuthorizationManager<Message<?>> messageAuthorizationManager() {
        MessageMatcherDelegatingAuthorizationManager.Builder messages =
                MessageMatcherDelegatingAuthorizationManager.builder();

        messages.nullDestMatcher().authenticated();
        messages.simpSubscribeDestMatchers("/user/**").permitAll();
        messages.simpMessageDestMatchers("/app/payment/**").permitAll();
        messages.simpMessageDestMatchers("/app/room/**").authenticated();
        messages.anyMessage().authenticated();

        return messages.build();
    }

}
