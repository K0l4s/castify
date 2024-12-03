package com.castify.backend.service.user;

import com.castify.backend.entity.UserEntity;
import com.castify.backend.models.paginated.PaginatedResponse;
import com.castify.backend.models.user.*;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IUserService {
    UserModel getUserByUsername(String username) throws Exception;

    UserDetailModel getProfileDetail(String username) throws Exception;

    UserDetailModel getSelfProfileDetail() throws Exception;

    UserDetailModel mapToUserDetailModel(UserEntity userEntity) throws Exception;

    UserModel getUserByToken() throws Exception;

    UserModel updateUserInformation() throws Exception;

    String updateAvatar(MultipartFile imageFile) throws Exception;

    String updateCover(MultipartFile imageFile) throws Exception;

    UserEntity getUserByAuthentication() throws Exception;

    UpdateUserModel updateUserInformationById(UpdateUserModel updateUserModel) throws Exception;

    String updateUsernameById(String username) throws Exception;

    String toggleFollow(String username) throws Exception;

    List<UserSimple> getRecommendUser() throws Exception;


    PaginatedResponse<BasicUserModel> getAllUser(Integer pageNumber, Integer pageSize) throws Exception;


    void checkAdmin() throws Exception;

    BasicUserModel mapToBasicUser(UserEntity userEntity);
}
