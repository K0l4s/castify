package com.castify.backend.models.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserSimple {
    private String id;
    private String firstName;
    private String middleName;
    private String lastName;
    private String username;
    private String avatarUrl;
}
