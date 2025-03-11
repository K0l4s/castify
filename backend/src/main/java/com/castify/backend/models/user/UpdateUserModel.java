package com.castify.backend.models.user;

import com.castify.backend.entity.location.WardEntity;
import com.castify.backend.enums.Role;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserModel {
    private String firstName;
    private String middleName;
    private String lastName;
    private String username;
    private String wardId;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime birthday;
//    private String address;
    private String addressElements;
    private String provinces;
    private String district;
    private String ward;
}
