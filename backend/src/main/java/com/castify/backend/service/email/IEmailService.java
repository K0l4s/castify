package com.castify.backend.service.email;

import com.castify.backend.enums.AppType;

public interface IEmailService {
    void sendVerificationMail(String email,String tokenValid, AppType appType);
    void sendWelcomeMessage(String email, String fullName);
}
