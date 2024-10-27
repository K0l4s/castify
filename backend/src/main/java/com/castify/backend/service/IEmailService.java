package com.castify.backend.service;

public interface IEmailService {
    void sendVerificationMail(String email,String tokenValid);
    void sendWelcomeMessage(String email, String fullName);
}
