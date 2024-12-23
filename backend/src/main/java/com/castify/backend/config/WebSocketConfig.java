package com.castify.backend.config;

import com.castify.backend.repository.UserRepository;
import com.castify.backend.service.authenticatation.jwt.IJwtService;
import com.castify.backend.service.authenticatation.jwt.JwtServiceImpl;
import com.castify.backend.utils.SocketJwtAuthenticationToken;
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
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.messaging.support.ChannelInterceptor;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private static final String AUTHORIZATION_HEADER = "Authorization";
    @Autowired
    private IJwtService jwtService = new JwtServiceImpl();
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private WebSocketAuthenticator webSocketAuthenticator;
//    @Override
//    public void configureMessageBroker(MessageBrokerRegistry config) {
//        config.enableSimpleBroker("/topic", "/queue"); // Kênh công khai và riêng tư
//        config.setApplicationDestinationPrefixes("/app");
//        config.setUserDestinationPrefix("/user"); // Định nghĩa tiền tố cho kênh riêng của từng user
//    }


    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5000")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {

                    String bearerToken = accessor.getFirstNativeHeader(AUTHORIZATION_HEADER);
                    final SocketJwtAuthenticationToken authenticationToken = webSocketAuthenticator.getAuthenticatedOrFail(bearerToken);

                    accessor.setUser(authenticationToken);
                }
                return message;
            }
        });
    }

    @Bean
    public ChannelInterceptor csrfChannelInterceptor(){
        //disabling csrf
        return new ChannelInterceptor() {

        };
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        ThreadPoolTaskScheduler te = new ThreadPoolTaskScheduler();
        te.setPoolSize(1);
        te.setThreadNamePrefix("wss-heartbeat-thread-");
        te.initialize();

        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/topic","/chatroom","/user","/admin")
                .setTaskScheduler(te)
                .setHeartbeatValue(new long[] {30000, 30000}); // Heartbeat every 30 seconds
        registry.setUserDestinationPrefix("/user");
    }
    @Bean
    public MessageMatcherDelegatingAuthorizationManager.Builder messageMatcherDelegatingAuthorizationManagerBuilder() {
        return new MessageMatcherDelegatingAuthorizationManager.Builder();
    }

    @Bean
    AuthorizationManager<Message<?>> messageAuthorizationManager(
            MessageMatcherDelegatingAuthorizationManager.Builder messages) {
        messages.nullDestMatcher().authenticated();
        messages.simpSubscribeDestMatchers("/user/**").hasAuthority("USER");
        messages.simpMessageDestMatchers("/app/private-message").hasAuthority("USER");
        messages.simpMessageDestMatchers("/app/react-message").hasAuthority("USER");
        messages.simpMessageDestMatchers("/app/group-chat").hasAuthority("USER");
        messages.simpSubscribeDestMatchers("/user/admin/**").hasAuthority("ADMIN");
        messages.simpDestMatchers("app/admin/**").hasAuthority("ADMIN");
        messages.anyMessage().authenticated();

        return messages.build();
    }
}

