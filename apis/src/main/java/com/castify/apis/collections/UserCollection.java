package com.castify.apis.collections;

import com.castify.apis.enums.Role;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id; // You can still use this for the Id annotation
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Document(collection = "user")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCollection implements UserDetails {

    @Id
    private String id; // Change Integer to String for MongoDB
    private String fullname;
    private String avatar_url;
    private String cover_url;
    private String email;
    private String password;
    private LocalDate birthday;
    private String address;
    private String phone;
    private String code;
    private LocalDateTime createDay;
    private boolean isActive;
    private boolean isLock = false; // Considered locked
    private String nickName;

    @Enumerated(EnumType.STRING)
    private Role role;

    @DBRef // Use DBRef for referencing TokenCollection
    private List<TokenCollection> tokens;

    public UserCollection(String email, String fullname) {
        this.email = email;
        this.fullname = fullname;
    }

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
        return email;
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
        return isActive;
    }
}
