package com.castify.apis.models.authentication;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String fullname;
    private String email;
    private String nickName;
    private String password;
    private LocalDate birthday;
    private String address;
    private String phone;
}
