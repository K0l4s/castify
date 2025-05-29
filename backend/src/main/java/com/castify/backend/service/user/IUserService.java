package com.castify.backend.service.user;

import com.castify.backend.entity.UserEntity;
import com.castify.backend.models.paginated.PaginatedResponse;
import com.castify.backend.models.user.*;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IUserService {
    UserModel getUserByUsername(String username) throws Exception;

    UserModel getByUserId(String userId) throws Exception;

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


    List<UserSimple> recommendUsers() throws Exception;

    PaginatedResponse<BasicUserModel> getAllUser(Integer pageNumber, Integer pageSize) throws Exception;


    PaginatedResponse<BasicUserModel> findUser(Integer pageNumber, Integer pageSize, String keyword) throws Exception;

    //    @Override
    //    public Page<UserEntity> getAllUserA(Integer pageNumber, Integer pageSize) throws Exception {
    //        checkAdmin();
    //
    //        Pageable pageable = PageRequest.of(pageNumber,pageSize);
    //
    //        Page<UserEntity> similarUsers = userRepository.findAll(pageable);
    //        return similarUsers;
    //    }
    String toggleBanUser(String userId) throws Exception;


    void banAccount(String userId) throws Exception;

    void checkAdmin() throws Exception;

    PaginatedResponse<UserSimple> searchUser(Integer pageNumber, Integer pageSize, String keyword) throws Exception;

    PaginatedResponse<UserSimple> getFollowerUserListByUser(int pageNumber, int pageSize) throws Exception;

    PaginatedResponse<UserSimple> getFollowerList(int pageNumber, int pageSize, String username) throws Exception;

    PaginatedResponse<UserSimple> getFollowingList(int pageNumber, int pageSize, String username) throws Exception;

    BasicUserModel mapToBasicUser(UserEntity userEntity);

    PaginatedResponse<UserSimple> getFriendList(String keyword,Integer pageNumber, Integer pageSize) throws Exception;
    void updateFavoriteGenres(List<String> genreIds);
}
