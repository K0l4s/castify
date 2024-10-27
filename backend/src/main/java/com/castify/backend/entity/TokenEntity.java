package com.castify.backend.entity;

import com.castify.backend.enums.TokenType;
import org.springframework.data.annotation.Id; // Sửa dòng này
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "token")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenEntity {

    @Id
    private String id; // Change Integer to String for MongoDB

    private String token;

    private TokenType tokenType = TokenType.BEARER;

    private String userId;

    private boolean revoked;

    private boolean expired;

//    @DBRef
//    private UserCollection userCollection;
}
