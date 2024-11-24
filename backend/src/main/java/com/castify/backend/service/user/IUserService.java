package com.castify.backend.service.user;

import com.castify.backend.entity.UserEntity;
import com.castify.backend.models.user.UpdateUserModel;
import com.castify.backend.models.user.UserDetailModel;
import com.castify.backend.models.user.UserModel;
import org.springframework.web.multipart.MultipartFile;

public interface IUserService {
    UserModel getUserByUsername(String username) throws Exception;

    UserDetailModel getProfileDetail(String username) throws Exception;

    UserDetailModel getSelfProfileDetail() throws Exception;

    UserModel getUserByToken() throws Exception;

    UserModel updateUserInformation() throws Exception;

    String updateAvatar(MultipartFile imageFile) throws Exception;

    UserEntity getUserByAuthentication() throws Exception;

    UpdateUserModel updateUserInformationById(UpdateUserModel updateUserModel) throws Exception;

    String updateUsernameById(String username) throws Exception;

    String toggleFollow(String username) throws Exception;
}
