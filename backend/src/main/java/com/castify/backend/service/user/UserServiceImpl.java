package com.castify.backend.service.user;

import com.castify.backend.entity.UserEntity;
import com.castify.backend.models.user.UpdateUserModel;
import com.castify.backend.models.user.UserDetailModel;
import com.castify.backend.models.user.UserModel;
import com.castify.backend.repository.PodcastRepository;
import com.castify.backend.repository.UserRepository;
import com.castify.backend.service.uploadFile.IUploadFileService;
import com.castify.backend.service.uploadFile.UploadFileServiceImpl;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements IUserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PodcastRepository podcastRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private IUploadFileService uploadFileService;



    @Override
    public UserModel getUserByUsername(String username) throws Exception {

        Optional<UserEntity> userData = userRepository.findByUsername(username);
        if (userData.isPresent()) {
            return modelMapper.map(userData.get(), UserModel.class);


        } else {
            throw new Exception("Not found user with username " + username);
        }
    }

//    @Override
//    public UserDetailModel getProfileDetail(String username) throws Exception {
//
//        UserEntity targetData = userRepository.findUserEntityByUsername(username);
//
//        // Tạo custom mapping hoặc sử dụng logic thủ công
//        UserDetailModel userDetail = modelMapper.map(targetData, UserDetailModel.class);
//        long followerSize = userRepository.findUsersFollowing(targetData.getId()).size();
//        userDetail.setTotalFollower(followerSize);
//
////        userDetail.setTotalFollowing(targetData.getTotalFollowing());
//        long podcastSize = podcastRepository.countByUser(targetData);
//        userDetail.setTotalPost(podcastSize);
////        userDetail.isFollow = set (isFollow);
//        try {
//            UserEntity userData = getUserByAuthentication();
//            if (userData.getFollowing() == null) {
//                userData.setFollowing(new ArrayList<>());
//            }
//            userDetail.setIsFollow(userData.isFollow(targetData.getId()));
//        }catch(Exception ex){
//            userDetail.setIsFollow(false);
//        }
//        return userDetail;
//    }
//@Override
//public UserDetailModel getSelfProfileDetail() throws Exception {
//    UserEntity userData = getUserByAuthentication();
//
//
//    // Tạo custom mapping hoặc sử dụng logic thủ công
//    UserDetailModel userDetail = modelMapper.map(userData, UserDetailModel.class);
////            userDetail.setFullname(userData.getFullname());
//    long followerSize = userRepository.findUsersFollowing(userData.getId()).size();
//    userDetail.setTotalFollower(followerSize);
//
//    userDetail.setTotalFollowing(userData.getTotalFollowing());
//    long podcastSize = podcastRepository.countByUser(userData);
//    userDetail.setTotalPost(podcastSize);
//
//    return userDetail;
//}
@Override
public UserDetailModel getProfileDetail(String username) throws Exception {
    UserEntity targetData = userRepository.findUserEntityByUsername(username);
    return mapToUserDetailModel(targetData);
}
    @Override
    public UserDetailModel getSelfProfileDetail() throws Exception {
        UserEntity userData = getUserByAuthentication();
        return mapToUserDetailModel(userData);
    }
    @Override
    public UserDetailModel mapToUserDetailModel(UserEntity userEntity) throws Exception {
        // Tạo custom mapping hoặc sử dụng logic thủ công
        UserDetailModel userDetail = modelMapper.map(userEntity, UserDetailModel.class);

        // Tính toán số lượng follower
        long followerSize = userRepository.findUsersFollowing(userEntity.getId()).size();
        userDetail.setTotalFollower(followerSize);

        // Tính toán số lượng posts
        long podcastSize = podcastRepository.countByUser(userEntity);
        userDetail.setTotalPost(podcastSize);

        // Kiểm tra người dùng hiện tại có follow người này không
        try {
            UserEntity currentUser = getUserByAuthentication();
            if (currentUser.getFollowing() == null) {
                currentUser.setFollowing(new ArrayList<>());
            }
            userDetail.setIsFollow(currentUser.isFollow(userEntity.getId()));
        } catch (Exception ex) {
            userDetail.setIsFollow(false);
        }

        return userDetail;
    }



    @Override
    public UserModel getUserByToken() throws Exception {
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        String usernameOrEmail = authentication.getName();
//        UserEntity userData = userRepository.findByEmailOrUsername(usernameOrEmail)
//                .orElseThrow(() -> new RuntimeException("User not found with email: " + usernameOrEmail));
        UserEntity userData = getUserByAuthentication();
        return modelMapper.map(userData, UserModel.class);

    }

    @Override
    public UserModel updateUserInformation() throws Exception {
        UserEntity authenticatedUser = getUserByAuthentication();

        // Step 2: Fetch the user entity from the repository
        Optional<UserEntity> optionalUserEntity = userRepository.findById(authenticatedUser.getId());

        if (optionalUserEntity.isEmpty()) {
            throw new Exception("User not found with ID: " + authenticatedUser.getId());
        }


        return null;
    }

    @Override
    public String updateAvatar(MultipartFile imageFile) throws Exception {
        UserEntity userData = getUserByAuthentication();
        String imageUrl = uploadFileService.uploadImage(imageFile);
        userData.setAvatarUrl(imageUrl);
        userRepository.save(userData);
        return imageUrl;
    }

    @Override
    public UserEntity getUserByAuthentication() throws Exception {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String usernameOrEmail = authentication.getName();
        return userRepository.findByEmailOrUsername(usernameOrEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + usernameOrEmail));
    }

    @Override
    public UpdateUserModel updateUserInformationById(UpdateUserModel updateUserModel) throws Exception {
        UserEntity userData = getUserByAuthentication();
//        LocalDateTime lastUpdateUsername = userData.getLastUpdateUsername();

//        userData.setUsername(updateUserModel.getUsername());
        userData.setFirstName(updateUserModel.getFirstName());
        userData.setMiddleName(updateUserModel.getMiddleName());
        userData.setLastName(updateUserModel.getLastName());
        userData.setBirthday(updateUserModel.getBirthday());
        userData.setAddressElements(updateUserModel.getAddressElements());
        userData.setProvinces(updateUserModel.getProvinces());
        userData.setDistrict(updateUserModel.getDistrict());
        userData.setWard(updateUserModel.getWard());
//        userData.setAddressElements(u);
//        userData.setAddress(updateUserModel.getAddress());
//        userData.setLastUpdateUsername(LocalDateTime.now());

        UserEntity updatedUser = userRepository.save(userData);
        return modelMapper.map(updatedUser, UpdateUserModel.class);
    }

    @Override
    public String updateUsernameById(String username) throws Exception {
        UserEntity userData = getUserByAuthentication();
        LocalDateTime lastUpdateUsername = userData.getLastUpdateUsername();
        if (lastUpdateUsername != null && ChronoUnit.DAYS.between(lastUpdateUsername, LocalDateTime.now()) < 7 && userData.getUsername().equals(username)) {
            throw new Exception("Username không thể cập nhật vì chưa đủ 7 ngày kể từ lần cập nhật cuối.");
        }
        userData.setUsername(username);
        userData.setLastUpdateUsername(LocalDateTime.now());
        userRepository.save(userData);
        return username;
    }

    @Override
    public String toggleFollow(String username) throws Exception {
        UserEntity userData = getUserByAuthentication();
        Optional<UserEntity> targetUserOptional = userRepository.findByUsername(username);

        UserEntity targetUser = targetUserOptional.orElseThrow(() -> new Exception("User not found"));

        // Kiểm tra nếu userData và targetUser là cùng một người
        if (userData.getUsername().equals(targetUser.getUsername())) {
            return "You cannot follow or unfollow yourself.";
        }
        if (userData.getFollowing() == null) {
            userData.setFollowing(new ArrayList<>());
        }
        // Logic xử lý follow hoặc unfollow
        if (userData.getFollowing().contains(targetUser.getId())) {
            userData.getFollowing().remove(targetUser.getId());
            userRepository.save(userData);
            return "Unfollowed successfully.";
        } else {
            userData.getFollowing().add(targetUser.getId());
            userRepository.save(userData);
            return "Followed successfully.";
        }
    }
    public List<UserEntity> suggestFriends(UserEntity currentUser) {
        // Lấy danh sách tất cả người dùng
        List<UserEntity> allUsers = userRepository.findAll();

        // Lọc những người dùng khác với currentUser
        List<UserEntity> potentialFriends = allUsers.stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .collect(Collectors.toList());

        // Ưu tiên dựa trên địa điểm
        List<UserEntity> locationMatched = potentialFriends.stream()
                .filter(user ->
                        Objects.equals(user.getWard(), currentUser.getWard()) &&
                                Objects.equals(user.getDistrict(), currentUser.getDistrict()) &&
                                Objects.equals(user.getProvinces(), currentUser.getProvinces())
                ).collect(Collectors.toList());

        // Tìm những người dùng có số lượng following tương tự
        List<UserEntity> similarFollowing = potentialFriends.stream()
                .filter(user -> {
                    int commonFollowers = (int) user.getFollowing().stream()
                            .filter(currentUser.getFollowing()::contains)
                            .count();
                    return commonFollowers > 2; // Điều kiện "tương tự" dựa trên số lượng following chung
                })
                .collect(Collectors.toList());

        // Gộp danh sách và ưu tiên locationMatched trước
        Set<UserEntity> suggestedFriends = new LinkedHashSet<>();
        suggestedFriends.addAll(locationMatched);
        suggestedFriends.addAll(similarFollowing);

        return new ArrayList<>(suggestedFriends);
    }
}
