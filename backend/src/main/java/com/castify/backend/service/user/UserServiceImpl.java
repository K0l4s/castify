package com.castify.backend.service.user;

import com.castify.backend.entity.UserEntity;
import com.castify.backend.models.user.UpdateUserModel;
import com.castify.backend.models.user.UserModel;
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
import java.util.Optional;

@Service
public class UserServiceImpl implements IUserService {
    @Autowired
    private UserRepository userRepository;
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
        LocalDateTime lastUpdateUsername = userData.getLastUpdateUsername();

//        userData.setUsername(updateUserModel.getUsername());
        userData.setFirstName(updateUserModel.getFirstName());
        userData.setMiddleName(updateUserModel.getMiddleName());
        userData.setLastName(updateUserModel.getLastName());
        userData.setBirthday(updateUserModel.getBirthday());
        userData.setAddress(updateUserModel.getAddress());
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
}
