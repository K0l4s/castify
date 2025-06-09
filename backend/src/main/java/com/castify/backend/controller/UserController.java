package com.castify.backend.controller;

import com.castify.backend.entity.GenreEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.enums.Permission;
import com.castify.backend.enums.Role;
import com.castify.backend.models.user.GenrePreferenceRequest;
import com.castify.backend.models.user.UpdateUserModel;
import com.castify.backend.models.user.UserModel;
import com.castify.backend.models.user.UserSimple;
import com.castify.backend.repository.GenreRepository;
import com.castify.backend.service.uploadFile.IUploadFileService;
import com.castify.backend.service.uploadFile.UploadFileServiceImpl;
import com.castify.backend.service.user.IUserService;
import com.castify.backend.service.user.UserServiceImpl;
import io.jsonwebtoken.MalformedJwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {
    @Autowired
    private IUserService userService = new UserServiceImpl();
    private static final Logger logger = Logger.getLogger(PodcastController.class.getName());
    @Autowired
    private GenreRepository genreRepository;

    @GetMapping("/list/follower")
    private ResponseEntity<?> getFollowersList(
            @RequestParam(value = "username") String username,
            @RequestParam(value = "pageNumber") int pageNumber,
            @RequestParam(value = "pageSize") int pageSize
    ){
        try{
            return ResponseEntity.ok(userService.getFollowerList(pageNumber,pageSize,username));
        } catch (Exception e) {
            logger.info(e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        }
    }
    @GetMapping("/list/following")
    private ResponseEntity<?> getFollowingsList(
            @RequestParam(value = "username") String username,
            @RequestParam(value = "pageNumber") int pageNumber,
            @RequestParam(value = "pageSize") int pageSize
    ){
        try{
            return ResponseEntity.ok(userService.getFollowingList(pageNumber,pageSize,username));
        } catch (Exception e) {
            logger.info(e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        }
    }
    @GetMapping("")
    private ResponseEntity<?> getUserByUsername(
            @RequestParam(value = "username", required = false) String username) {
        try {

//            UserModel user = new UserModel();
            if (username != null)
                return ResponseEntity
                        .ok(userService.getProfileDetail(username));

            return ResponseEntity
                    .ok(userService.getSelfProfileDetail());
        } catch (Exception e) {
            return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        }
    }
    @GetMapping("/auth")
    private ResponseEntity<?> getUserAuth() {
        try {
            return ResponseEntity
                    .ok(userService.getUserByToken());
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Error: " + e.getMessage());
        }
    }
    @GetMapping("/recommend")
    private ResponseEntity<?> getRecommendUser(@RequestParam(value = "pageNumber",defaultValue = "0") int pageNumber,
                                               @RequestParam(value = "pageSize", defaultValue="4") int pageSize) throws Exception {
        try {
            return ResponseEntity.ok(userService.recommendUsers(pageNumber,pageSize));
        } catch (Exception e) {
            e.printStackTrace(); // In toàn bộ lỗi thật ra console
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Có lỗi xảy ra: " + e.getMessage());
        }
    }
    @PutMapping("/avatar")
    private ResponseEntity<String> updateAvatar(
            @RequestPart("avatar") MultipartFile avatarFile
            )
    {
        try{
            return ResponseEntity.ok(
                    userService.updateAvatar(avatarFile)
            );

        }catch (Exception e){
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Error"+e.getMessage());
        }
    }
    @PutMapping("/cover")
    private ResponseEntity<String> updateCover(
            @RequestPart("cover") MultipartFile avatarFile
    )
    {
        try{
            return ResponseEntity.ok(
                    userService.updateCover(avatarFile)
            );

        }catch (Exception e){
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Error"+e.getMessage());
        }
    }
    @PutMapping("")
    private ResponseEntity<?> updateInformationByToken(
            @RequestBody UpdateUserModel updateUserModel
            ) throws Exception {
        try{
            return ResponseEntity.ok(
                    userService.updateUserInformationById(updateUserModel)
            );
        }catch (Exception ex){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error"+ ex.getMessage());
        }
    }

    @PutMapping("/follow")
    private ResponseEntity<?> toggleFollow(
            @RequestParam(value = "username") String username
    ) throws Exception{
        try{
            return ResponseEntity.ok(
                    userService.toggleFollow(username)
            );
        }catch (Exception ex){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error"+ex.getMessage());
        }
    }
//    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/followers")
    private ResponseEntity<?> getFollowersList (
            @RequestParam("pageNumber") Integer pageNumber,
            @RequestParam("pageSize") Integer pageSize
    ){
        try{
            return ResponseEntity.ok(
                    userService.getFollowerUserListByUser(pageNumber,pageSize)
            );
        }catch(Exception ex){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error"+ex.getMessage());
        }
    }
    @GetMapping("/list/friends")
    private ResponseEntity<?> getFriendsList (
            @RequestParam("pageNumber") Integer pageNumber,
            @RequestParam("pageSize") Integer pageSize,
            @RequestParam(value = "keyword",required = false) String keyword
    ){
        try{
            return ResponseEntity.ok(
                    userService.getFriendList(keyword,pageNumber,pageSize)
            );
        }catch(Exception ex){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error"+ex.getMessage());
        }
    }

    @PostMapping("/favorite-genres")
    public ResponseEntity<?> updateFavoriteGenres(@RequestBody GenrePreferenceRequest request) {
        userService.updateFavoriteGenres(request.getGenreIds());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/suggested-genres")
    public ResponseEntity<?> getSuggestedGenres() {
        try {
            // Kiểm tra xem user đã đăng nhập chưa
            UserEntity currentUser = null;
            try {
                currentUser = userService.getUserByAuthentication();
            } catch (Exception e) {
                // User chưa đăng nhập
                List<GenreEntity> allGenres = genreRepository.findByIsActiveTrue();
                return ResponseEntity.ok(allGenres);
            }

            // User đã đăng nhập
            List<String> suggestedGenreIds = currentUser.getSuggestedGenreIds();

            if (suggestedGenreIds.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            List<GenreEntity> suggestedGenres = genreRepository.findByIdInAndIsActiveTrue(suggestedGenreIds);

            return ResponseEntity.ok(suggestedGenres);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/favorite-genres")
    public ResponseEntity<?> getFavoriteGenres() {
        try {
            UserEntity currentUser = userService.getUserByAuthentication();
            List<String> favoriteGenreIds = currentUser.getFavoriteGenreIds();

            if (favoriteGenreIds.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            List<GenreEntity> favoriteGenres = genreRepository.findByIdInAndIsActiveTrue(favoriteGenreIds);

            return ResponseEntity.ok(favoriteGenres);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error: " + e.getMessage());
        }
    }

    @ExceptionHandler(MalformedJwtException.class)
    public ResponseEntity<String> handleMalformedJwtException(MalformedJwtException ex) {
        return new ResponseEntity<>("Invalid JWT token format", HttpStatus.BAD_REQUEST);
    }


}
