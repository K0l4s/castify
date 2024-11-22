package com.castify.backend.models.user;

import com.castify.backend.enums.Role;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserModel {
    private String id;
    private String firstName;
    private String middleName;
    private String lastName;
    private String username;
//    private String avatarUrl;
//    private String coverUrl;
    private LocalDate birthday;
    private String address;
}
