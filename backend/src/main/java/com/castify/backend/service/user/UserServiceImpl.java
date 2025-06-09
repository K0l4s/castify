package com.castify.backend.service.user;

import com.castify.backend.entity.UserEntity;
import com.castify.backend.entity.location.WardEntity;
import com.castify.backend.enums.NotiType;
import com.castify.backend.enums.Role;
import com.castify.backend.models.PageDTO;
import com.castify.backend.models.paginated.PaginatedResponse;
import com.castify.backend.models.user.*;
import com.castify.backend.repository.PodcastRepository;
import com.castify.backend.repository.UserRepository;
import com.castify.backend.repository.WardRepository;
import com.castify.backend.repository.template.UserTemplate;
import com.castify.backend.service.notification.INotificationService;
import com.castify.backend.service.notification.NotificationServiceImpl;
import com.castify.backend.service.uploadFile.IUploadFileService;
import com.castify.backend.utils.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class UserServiceImpl implements IUserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PodcastRepository podcastRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private IUploadFileService uploadFileService;
    @Autowired
    private WardRepository wardRepository;
    @Autowired
    UserTemplate userRepositoryTemplate;
    @Autowired
    private INotificationService notificationService = new NotificationServiceImpl();

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
    public UserModel getByUserId(String userId) throws Exception {

        Optional<UserEntity> userData = userRepository.findById(userId);
        if (userData.isPresent()) {
            return modelMapper.map(userData.get(), UserModel.class);
        } else {
            throw new Exception("Not found user with username " + userId);
        }
    }

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
        long followerSize = userRepository.findUsersFollowers(userEntity.getId()).size();
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
    public String updateCover(MultipartFile imageFile) throws Exception {
        UserEntity userData = getUserByAuthentication();
        String imageUrl = uploadFileService.uploadImage(imageFile);
        userData.setCoverUrl(imageUrl);
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
        userData.setFirstName(updateUserModel.getFirstName());
        userData.setMiddleName(updateUserModel.getMiddleName());
        userData.setLastName(updateUserModel.getLastName());
        userData.setBirthday(updateUserModel.getBirthday());
        userData.setAddressElements(updateUserModel.getAddressElements());
        userData.setProvinces(updateUserModel.getProvinces());
        userData.setDistrict(updateUserModel.getDistrict());
        userData.setWard(updateUserModel.getWard());
        WardEntity wards = wardRepository.findWardEntityById(updateUserModel.getWardId());
//        WardEntity wards = wardRepository.findWardEntityById(updateUserModel.getWardId());
        if (wards == null) {
            throw new Exception("Ward not found with ID: " + updateUserModel.getWardId());
        }
        userData.setLocation(wards);

        userData.setLocation(wards);
        userData.setLocality(updateUserModel.getAddressElements());

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

        // Tìm xem user hiện tại đã theo dõi targetUser chưa
        Optional<FollowInfo> existingFollowing = userData.getFollowing()
                .stream()
                .filter(f -> f.getUserId().equals(targetUser.getId()))
                .findFirst();

        if (existingFollowing.isPresent()) {
            // Nếu đã theo dõi, thực hiện unfollow
            userData.getFollowing().remove(existingFollowing.get());
            userRepository.save(userData);
            return "Unfollowed successfully.";
        } else {
            // Nếu chưa theo dõi, thêm targetUser vào danh sách following
//            String receiverId, NotiType type, String title, String content, String url
            userData.getFollowing().add(new FollowInfo(targetUser.getId(), LocalDateTime.now()));
            userRepository.save(userData);
            notificationService.saveNotification(
                    targetUser.getId(),
                    NotiType.FOLLOW,
                    "Bạn có một Follow mơi!",
                    "Bạn đã được theo dõi bởi "+userData.getFullname()+"!",
                    "/profile/"+targetUser.getUsername()
            );
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

    @Override
    public List<UserSimple> getRecommendUser() throws Exception {
        UserEntity currentUser = getUserByAuthentication();

        // Sử dụng PageRequest để tạo Pageable với trang đầu tiên và mỗi trang có 10 người dùng
        Pageable pageable = PageRequest.of(0, 10);

        // Lấy danh sách người dùng giống nhau, sử dụng Pageable
        Page<UserEntity> similarUsers = userRepositoryTemplate.findSimilarUsers(currentUser, pageable);

        // Chuyển đổi các UserEntity thành UserSimple
        List<UserSimple> resultUsers = similarUsers.getContent().stream()
                .map(userEntity -> mapToUserSimple(userEntity, currentUser))
                .collect(Collectors.toList());

        // Trả về danh sách người dùng đã được chuyển đổi
        return resultUsers;
    }
    @Override
    public PageDTO<UserSimple> recommendUsers(int page, int size) throws Exception {
        UserEntity currentUser = getUserByAuthentication();
        List<UserEntity> allUsers = userRepository.findAll();

        Map<String, Integer> scores = new HashMap<>();
        Map<String, UserEntity> userMap = new HashMap<>();

        Set<String> currentGenres = new HashSet<>(currentUser.getFavoriteGenreIds());
        Set<String> currentFollowTargets = currentUser.getFollowing().stream()
                .map(FollowInfo::getUserId)
                .collect(Collectors.toSet());
        String currentProvince = currentUser.getProvinces();

        for (UserEntity other : allUsers) {
            if (other.getId().equals(currentUser.getId())) continue;
            if (currentUser.isFollow(other.getId())) continue;

            int score = 0;

            // Tính điểm theo địa chỉ
            if (currentProvince != null && currentProvince.equals(other.getProvinces())) {
                score += 3;
            }

            // Tính điểm theo sở thích
            Set<String> otherGenres = new HashSet<>(other.getFavoriteGenreIds());
            otherGenres.retainAll(currentGenres);
            score += otherGenres.size() * 2;

            // Tính điểm theo follow trùng
            Set<String> otherFollowTargets = other.getFollowing().stream()
                    .map(FollowInfo::getUserId)
                    .collect(Collectors.toSet());
            otherFollowTargets.retainAll(currentFollowTargets);
            score += otherFollowTargets.size() * 2;

            if (score > 0) {
                scores.put(other.getId(), score);
                userMap.put(other.getId(), other);
            }
        }

        // Sắp xếp theo điểm giảm dần
        List<UserSimple> sortedRecommendations = scores.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .map(entry -> {
                    UserEntity user = userMap.get(entry.getKey());
                    return mapToUserSimple(user, currentUser);
                })
                .collect(Collectors.toList());

        int totalElements = sortedRecommendations.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, totalElements);

        List<UserSimple> pageContent = fromIndex >= totalElements
                ? Collections.emptyList()
                : sortedRecommendations.subList(fromIndex, toIndex);

        return new PageDTO<>(pageContent, page, totalPages, totalElements);
    }




    @Override
    public PaginatedResponse<BasicUserModel> getAllUser(Integer pageNumber, Integer pageSize) throws Exception {
        Pageable pageable = PageRequest.of(pageNumber, pageSize);

        Page<UserEntity> similarUsers = userRepository.findAll(pageable);

        List<BasicUserModel> resultUsers = similarUsers.getContent().stream()
                .map(this::mapToBasicUser)
                .collect(Collectors.toList());
        int totalPages = similarUsers.getTotalPages();
        return new PaginatedResponse<>(resultUsers, totalPages);
    }

    @Override
    public PaginatedResponse<BasicUserModel> findUser(Integer pageNumber, Integer pageSize, String keyword) throws Exception {
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        Page<UserEntity> similarUsers = userRepository.findByKeyword(keyword, pageable);

        List<BasicUserModel> resultUsers = similarUsers.getContent().stream()
                .map(this::mapToBasicUser)
                .collect(Collectors.toList());
        int totalPages = similarUsers.getTotalPages();
        return new PaginatedResponse<>(resultUsers, totalPages);
    }

    @Override
    public String toggleBanUser(String userId) throws Exception {
        UserEntity userBan = userRepository.findUserEntityById(userId);
//        userBan.isNonBanned(!userBan.isNonBanned());
        userBan.setNonBanned(!userBan.isNonBanned());
        userRepository.save(userBan);
        if (userBan.isNonBanned())
            return "Unban Account Successfully";
        return "Ban Account Successfully";
    }

    @Override
    public void banAccount(String userId) throws Exception {
        UserEntity userBan = userRepository.findUserEntityById(userId);
//        userBan.isNonBanned(!userBan.isNonBanned());
        userBan.setNonBanned(false);
        userRepository.save(userBan);
    }

    @Override
    public void checkAdmin() throws Exception {
        UserEntity userRequest = getUserByAuthentication();
        if (!userRequest.getRole().equals(Role.ADMIN))
            throw new Exception("You don't have permission to send this request! Please login with admin role!");

    }

    @Override
    public PaginatedResponse<UserSimple> searchUser(Integer pageNumber, Integer pageSize, String keyword) throws Exception {
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
//        UserEntity currentUser=getUserByAuthentication();
        Page<UserEntity> similarUsers = userRepositoryTemplate.findByKeywordWithAggregation(keyword, pageable);

        List<UserSimple> resultUsers = similarUsers.getContent().stream()
                .map(this::mapToUserSimpleAnonymous)
                .collect(Collectors.toList());
        int totalPages = similarUsers.getTotalPages();
        return new PaginatedResponse<>(resultUsers, totalPages);
    }

    @Override
    public PaginatedResponse<UserSimple> getFollowerUserListByUser(int pageNumber, int pageSize) throws Exception {
        // Lấy thông tin người dùng hiện tại
        UserEntity currentUser = getUserByAuthentication();

        // Tạo Pageable để hỗ trợ phân trang
        Pageable pageable = PageRequest.of(pageNumber, pageSize);

        // Truy vấn danh sách người theo dõi từ repository
        Page<UserEntity> followersPage = userRepository.findFollowersList(currentUser.getId(), pageable);

        // Sử dụng ModelMapper để ánh xạ từ UserEntity sang UserSimple
        ModelMapper modelMapper = new ModelMapper();
        List<UserSimple> followers = followersPage.getContent().stream()
                .map(this::mapToUserSimpleAnonymous)
                .toList();

        // Trả về response với dữ liệu và số trang
        return new PaginatedResponse<>(followers, followersPage.getTotalPages());
    }

    @Override
    public PaginatedResponse<UserSimple> getFollowerList(int pageNumber, int pageSize, String username) throws Exception {
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
//        UserEntity currentUser = getUserByAuthentication();
        UserEntity user = userRepository.findUserEntityByUsername(username);

        // Fetch the list of followers for the user
        Page<UserEntity> userList = userRepository.findFollowersList(user.getId(), pageable);

        // Map user entities to user simple DTOs
        List<UserSimple> userSimplesMap = userList.stream()
                .map(this::mapToUserSimpleAnonymous)
                .collect(Collectors.toList());

        // Build and return the PaginatedResponse
        return new PaginatedResponse<>(
                userSimplesMap,
                (int) userList.getTotalElements() // Total count of items, not pages
        );
    }

    @Override
    public PaginatedResponse<UserSimple> getFollowingList(int pageNumber, int pageSize, String username) throws Exception {
        Pageable pageable = PageRequest.of(pageNumber, pageSize);

        // Lấy user theo username
        UserEntity user = userRepository.findUserEntityByUsername(username);
        if (user == null) {
            throw new Exception("User not found with username: " + username);
        }

        // Lấy danh sách userId từ following
        List<String> followingUserIds = user.getFollowing()
                .stream()
                .map(FollowInfo::getUserId)
                .collect(Collectors.toList());

        // Truy vấn phân trang từ MongoDB
        Page<UserEntity> userPage = userRepository.findByIdIn(followingUserIds, pageable);

        // Chuyển đổi sang DTO
        List<UserSimple> userSimplesMap = userPage.getContent()
                .stream()
                .map(this::mapToUserSimpleAnonymous)
                .collect(Collectors.toList());

        // Trả về kết quả với phân trang
        return new PaginatedResponse<>(
                userSimplesMap,
                (int) userPage.getTotalElements()
        );
    }

    private UserSimple mapToUserSimpleAnonymous(UserEntity userEntity) {
        // Chuyển đổi UserEntity thành UserSimple
        UserSimple userSimple = modelMapper.map(userEntity, UserSimple.class);

        // Tính toán các thuộc tính bổ sung
        userSimple.setTotalFollower(getFollowerCount(userEntity));
        userSimple.setTotalPost(getPostCount(userEntity));
        try {
            UserEntity currentUser = getUserByAuthentication();
            userSimple.setIsFollow(isUserFollowing(currentUser, userEntity));
        } catch (Exception ex) {
            userSimple.setIsFollow(false);
        }

        return userSimple;
    }

    private UserSimple mapToUserSimple(UserEntity userEntity, UserEntity currentUser) {
        // Chuyển đổi UserEntity thành UserSimple
        UserSimple userSimple = modelMapper.map(userEntity, UserSimple.class);

        // Tính toán các thuộc tính bổ sung
        userSimple.setTotalFollower(getFollowerCount(userEntity));
        userSimple.setTotalPost(getPostCount(userEntity));
        userSimple.setIsFollow(isUserFollowing(currentUser, userEntity));

        return userSimple;
    }

    private long getFollowerCount(UserEntity userEntity) {
        return userRepository.findUsersFollowers(userEntity.getId()).size();
    }

    private long getPostCount(UserEntity userEntity) {
        return podcastRepository.countByUser(userEntity);
    }

    private boolean isUserFollowing(UserEntity currentUser, UserEntity targetUser) {
        try {
            if (currentUser.getFollowing() == null) {
                currentUser.setFollowing(new ArrayList<>());
            }
            return currentUser.isFollow(targetUser.getId());
        } catch (Exception ex) {
            return false;
        }
    }

    @Override
    public BasicUserModel mapToBasicUser(UserEntity userEntity) {
        // Chuyển đổi UserEntity thành UserSimple
        BasicUserModel userSimple = modelMapper.map(userEntity, BasicUserModel.class);

        // Tính toán các thuộc tính bổ sung
        userSimple.setTotalFollower(getFollowerCount(userEntity));
        userSimple.setTotalPost(getPostCount(userEntity));

        return userSimple;
    }
    @Override
    public PaginatedResponse<UserSimple> getFriendList(String keyword, Integer pageNumber, Integer pageSize) throws Exception {
        UserEntity currentUser = getUserByAuthentication();

        List<ObjectId> followedIds = currentUser.getFollowing()
                .stream()
                .map(f -> new ObjectId(f.getUserId()))
                .collect(Collectors.toList());

        Pageable pageable = PageRequest.of(pageNumber, pageSize);

        Page<UserEntity> friends;

        if (keyword != null && !keyword.trim().isEmpty()) {
            friends = userRepository.findMutualFriendsWithKeyword(currentUser.getId(), followedIds, keyword, pageable);
        } else {
            friends = userRepository.findMutualFriends(currentUser.getId(), followedIds, pageable);
        }

        List<UserSimple> resultUsers = friends.getContent()
                .stream()
                .map(this::mapToUserSimpleAnonymous)
                .toList();

        return new PaginatedResponse<>(resultUsers, pageable.getPageSize());
    }

    @Override
    public void updateFavoriteGenres(List<String> genreIds) {
        UserEntity user = SecurityUtils.getCurrentUser();
        user.setFavoriteGenreIds(genreIds);
        userRepository.save(user);
    }

    @Override
    public Page<UserSimple> searchUsers(String keyword, Pageable pageable) {
        try {
            // Sử dụng method có sẵn
            Page<UserEntity> userEntities = userRepositoryTemplate.findByKeywordWithAggregation(keyword, pageable);

            // Convert to UserSimple
            List<UserSimple> userSimples = userEntities.getContent().stream()
                    .map(this::mapToUserSimpleAnonymous)
                    .collect(Collectors.toList());

            return new PageImpl<>(userSimples, pageable, userEntities.getTotalElements());

        } catch (Exception e) {
            log.error("Error searching users with keyword: {}", keyword, e);
            return Page.empty(pageable);
        }
    }

}
