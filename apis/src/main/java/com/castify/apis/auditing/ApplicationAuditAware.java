package com.castify.apis.auditing;

import org.springframework.stereotype.Component;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import com.castify.apis.entity.UserEntity;
import java.util.Optional;

@Component
public class ApplicationAuditAware implements AuditorAware<String> {
    @Override
    public Optional<String> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            return Optional.empty();
        }

        UserEntity userEntityPrincipal = (UserEntity) authentication.getPrincipal();
        return Optional.ofNullable(userEntityPrincipal.getId().toString());
    }
}
