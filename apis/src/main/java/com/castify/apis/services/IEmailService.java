package com.castify.apis.services;

public interface IEmailService {
    void sendVerificationMail(String email, String code);
    void sendWelcomeMessage(String email, String fullName);
}
