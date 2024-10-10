package com.castify.apis.repositories;

import java.util.List;
import java.util.Optional;

import com.castify.apis.collections.UserCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<UserCollection, String> {

    Optional<UserCollection> findByEmail(String email);
    Optional<UserCollection> findUserEntityByNickName(String nickname);
    Optional<UserCollection> findByEmailAndCode(String email, String code);
    boolean existsUserEntityByEmailOrNickName(String email,String nickName);
    boolean existsUserEntityByEmail(String email);
    List<UserCollection> findByFullnameIgnoreCaseContaining(String fullname);

    List<UserCollection> findAllByIdIn(List<Integer> ids);

}
