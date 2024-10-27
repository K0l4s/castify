package com.castify.backend.entity;

import com.castify.backend.enums.Role;
import org.springframework.data.annotation.Id; // Sửa dòng này
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.Collection;
import java.util.List;

@Document(collection = "user")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity implements UserDetails {

    @Id
    private String id; // Change Integer to String for MongoDB
    private String firstName;
    private String middleName;
    private String lastName;
    private String username;
    private String avatarUrl;
    private String coverUrl;
    private LocalDate birthday;
    private String address;
    private String password;
    private String phone;
    private String email;
    private boolean isActive;
    private boolean isNonLocked;
    private boolean isNonBanned;
    private LocalDateTime createdDay;
    private LocalDateTime lastLogin;
    private List<String> badgesId;
//    @Enumerated(EnumType.STRING)
    private Role role;


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return role.getAuthorities();
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        if(isNonBanned && isNonLocked && isActive)
            return true;
        return false;
//        return isActive;
    }

    public String getFullname(){
        return lastName+" "+middleName+" "+firstName;
    }
    public int getAge(){
        LocalDate today = LocalDate.now();
        Period period = Period.between(birthday, today);
        return period.getYears();
    }


}
