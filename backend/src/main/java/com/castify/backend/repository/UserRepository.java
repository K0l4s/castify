package com.castify.backend.repository;

import java.util.Optional;

import com.castify.backend.entity.UserEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<UserEntity, String> {

    @Query("{ '$or' : [ { 'email' : ?0 }, { 'username' : ?0 } ] }")
    Optional<UserEntity> findByEmailOrUsername(String keyword);


    boolean existsByEmailOrUsername(String email,String username);
    Optional<UserEntity> findById(String id);
    Optional<UserEntity> findByUsername(String username);
//    boolean existsByUsername(String username);
}
