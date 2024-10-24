package com.castify.apis.repositories;

import java.util.List;
import java.util.Optional;

import com.castify.apis.collections.UserCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<UserCollection, String> {

    @Query("{ '$or' : [ { 'email' : ?0 }, { 'username' : ?0 } ] }")
    Optional<UserCollection> findByEmailOrUsername(String keyword);

}
