package com.castify.backend.service.authenticatation;

import com.castify.backend.models.authentication.AuthenticationResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;

public interface IGoogleVertifier {
    GoogleIdToken.Payload verify(String idTokenString);

    AuthenticationResponse authWithGoogle(GoogleIdToken.Payload user);
}
