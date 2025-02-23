package com.castify.backend.service.email;

public interface IEmailService {
    void sendVerificationMail(String email,String tokenValid, boolean isMobile);
    void sendWelcomeMessage(String email, String fullName);
}
