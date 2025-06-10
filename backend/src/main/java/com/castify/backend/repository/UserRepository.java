package com.castify.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.castify.backend.entity.UserEntity;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<UserEntity, String> {

    @Query("{ '$or' : [ { 'email' : ?0 }, { 'username' : ?0 } ] }")
    Optional<UserEntity> findByEmailOrUsername(String keyword);

    boolean existsByEmailOrUsername(String email, String username);

    Optional<UserEntity> findByEmail(String email);

    Optional<UserEntity> findById(String id);

    UserEntity findUserEntityById(String id);

    Optional<UserEntity> findByUsername(String username);

    UserEntity findUserEntityByUsername(String username);

    @Query("{ 'following.userId': ?0 }")
    List<UserEntity> findUsersFollowers(String userId);

    @Query("{ 'following.userId': ?0, 'following.timeStamp': { $gte: ?1, $lte: ?2 } }")
    List<UserEntity> findUsersFollowersBetween(String userId, LocalDateTime start, LocalDateTime end);
    @Query("""
    {
      "following.userId": ?0,
      "_id": {
        "$in": ?1
      }
    }
    """)
    Page<UserEntity> findMutualFriends(String currentUserId, List<ObjectId> followedUserIds,Pageable pageable);
    @Query("""
    {
      "following.userId": ?0,
      "_id": { "$in": ?1 },
      "$or": [
        { "firstName": { "$regex": ?2, "$options": "i" } },
            { "middleName": { "$regex": ?2, "$options": "i" } },
        { "lastName": { "$regex": ?2, "$options": "i" } },
        { "username": { "$regex": ?2, "$options": "i" } }
      ]
    }
    """)
    Page<UserEntity> findMutualFriendsWithKeyword(String currentUserId, List<ObjectId> followedUserIds, String keyword, Pageable pageable);


    @Query("{ 'following.userId': ?0 }")
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

//    UserEntity findUserEntityByUsername(String username,int pageNumber, int pageSize);
    Page<UserEntity> findByIdIn(List<String> userIds,Pageable pageable);

    List<UserEntity> findByUsedFrameId(String frameId);
//    boolean existsByUsername(String username);
    @Query("{ '_id': ?0 }")
    @Update("{ '$addToSet': { 'suggestedGenreIds': { '$each': ?1 } } }")
    void addSuggestedGenres(String userId, List<String> genreIds);
    @Query(value = "{ 'username': ?0 }", fields = "{ 'id': 1, 'username': 1, 'password': 1, 'role': 1, 'isActive': 1, 'isNonLocked': 1, 'isNonBanned': 1 }")
    Optional<UserEntity> findBasicInfoByUsername(String username);
}
