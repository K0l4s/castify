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

    boolean existsByEmailOrUsername(String email, String username);

    Optional<UserEntity> findById(String id);

    UserEntity findUserEntityById(String id);

    Optional<UserEntity> findByUsername(String username);

    UserEntity findUserEntityByUsername(String username);

    @Query("{ 'following': ?0 }")
    List<UserEntity> findUsersFollowers(String userId);
    @Query("{ 'following': ?0 }")
    Page<UserEntity> findFollowersList(String userId,Pageable pageable);
    @Query("{'$or': [" +
            "{'firstName': {'$regex': ?0, '$options': 'i'}}," + // Tìm kiếm trong firstName
            "{'middleName': {'$regex': ?0, '$options': 'i'}}," + // Tìm kiếm trong middleName
            "{'lastName': {'$regex': ?0, '$options': 'i'}}," + // Tìm kiếm trong lastName
            "{'ward': {'$regex': ?0, '$options': 'i'}}," + // Tìm kiếm trong ward
            "{'provinces': {'$regex': ?0, '$options': 'i'}}," + // Tìm kiếm trong provinces
            "{'district': {'$regex': ?0, '$options': 'i'}}," + // Tìm kiếm trong district+
//            "{'$regex': {'$concat': ['$lastName', ' ', '$middleName', ' ', '$firstName']}, '$options': 'i'}" + // Tìm kiếm trong lastName + middleName + firstName
            "]}")
    Page<UserEntity> findByKeyword(String keyword, Pageable pageable);



//    boolean existsByUsername(String username);
}
