package com.castify.backend.repository;

import java.util.List;
import java.util.Optional;

import com.castify.backend.entity.TokenEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TokenRepository extends MongoRepository<TokenEntity, String> { // Change Integer to String for MongoDB

    // Custom query to find all valid tokens by user ID
    @Query("{ 'userCollection.id': ?0, 'expired': false, 'revoked': false }")
    List<TokenEntity> findAllValidTokenByUser(String userId); // Change parameter type to String

    Optional<TokenEntity> findByToken(String token);
}
