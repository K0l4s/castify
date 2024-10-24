package com.castify.apis.collections;

import com.castify.apis.enums.TokenType;
import jakarta.persistence.Id; // You can still use this for the Id annotation
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "token")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenCollection {

    @Id
    private String id; // Change Integer to String for MongoDB

    private String token;

    private TokenType tokenType = TokenType.BEARER;

    private boolean revoked;

    private boolean expired;

    @DBRef
    private UserCollection userCollection;
}
