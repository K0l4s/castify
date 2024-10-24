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
    private String lastName;
    private String middleName;
    private String firstName;
    private String email;
    private String username;
    private String password;
    private LocalDate birthday;
    private String address;
    private String phone;
}
