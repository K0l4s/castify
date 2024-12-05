package com.castify.backend.repository;

import java.util.List;
import java.util.Optional;

import com.castify.backend.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<UserEntity, String> {

    @Query("{ '$or' : [ { 'email' : ?0 }, { 'username' : ?0 } ] }")
    Optional<UserEntity> findByEmailOrUsername(String keyword);
    boolean existsByEmailOrUsername(String email,String username);
    Optional<UserEntity> findById(String id);
    UserEntity findUserEntityById(String id);
    Optional<UserEntity> findByUsername(String username);
    UserEntity findUserEntityByUsername(String username);
    @Query("{ 'following': ?0 }")
    List<UserEntity> findUsersFollowing(String userId);
    @Query("{'$or': [{'firstName': ?0},{'lastName':?0}, {'middleName': ?0}, {'username' : ?0}, {'ward': ?0} ,{'provinces': ?0},{'district': ?0}]}")
    Page<UserEntity> findByKeyword(String keyword, Pageable pageable);
//    boolean existsByUsername(String username);
}
