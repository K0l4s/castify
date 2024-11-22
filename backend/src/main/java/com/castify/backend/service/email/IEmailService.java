package com.castify.backend.service.email;

public interface IEmailService {
    void sendVerificationMail(String email,String tokenValid);
    void sendWelcomeMessage(String email, String fullName);
}
