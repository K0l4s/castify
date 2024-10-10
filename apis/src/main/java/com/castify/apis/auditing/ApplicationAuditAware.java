package com.castify.apis.auditing;

import org.springframework.data.domain.AuditorAware;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.castify.apis.collections.UserCollection;
import java.util.Optional;

//public class ApplicationAuditAware implements AuditorAware<Integer> {
//    @Override
//    public Optional<Integer> getCurrentAuditor() {
//        Authentication authentication =
//                SecurityContextHolder
//                        .getContext()
//                        .getAuthentication();
//        if (authentication == null ||
//                !authentication.isAuthenticated() ||
//                authentication instanceof AnonymousAuthenticationToken
//        ) {
//            return Optional.empty();
//        }
//
//        UserCollection userEntityPrincipal = (UserCollection) authentication.getPrincipal();
//        return Optional.ofNullable(userEntityPrincipal.getId());
//    }
//}

public class ApplicationAuditAware implements AuditorAware<String> {
    @Override
    public Optional<String> getCurrentAuditor() {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication instanceof AnonymousAuthenticationToken) {
            return Optional.empty();
        }

        // Cast the principal to UserCollection and return the String id
        UserCollection userEntityPrincipal = (UserCollection) authentication.getPrincipal();
        return Optional.ofNullable(userEntityPrincipal.getId().toString()); // Convert to String if needed
    }
}
