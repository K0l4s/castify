package com.castify.backend.models.authentication;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChangePssReq {
    private String oldPassword;
    private String newPassword;
    private String repeatNewPassword;
}
