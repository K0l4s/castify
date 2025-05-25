package com.castify.backend.controller;

import com.castify.backend.entity.UserEntity;
import com.castify.backend.enums.Role;
import com.castify.backend.models.PageDTO;
import com.castify.backend.models.podcast.CreatePodcastModel;
import com.castify.backend.models.podcast.EditPodcastDTO;
import com.castify.backend.models.podcast.LikePodcastDTO;
import com.castify.backend.models.podcast.PodcastModel;
import com.castify.backend.models.user.UserModel;
import com.castify.backend.service.ffmpeg.IFFmpegService;
import com.castify.backend.service.genre.IGenreService;
import com.castify.backend.service.uploadFile.IUploadFileService;
import com.castify.backend.service.user.IUserService;
import com.castify.backend.service.user.UserServiceImpl;
import com.castify.backend.service.podcast.IPodcastService;
import com.castify.backend.service.podcast.PodcastServiceImpl;
import com.castify.backend.utils.FileUtils;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/v1/podcast")
public class PodcastController {
    @Autowired
    public IPodcastService podcastService = new PodcastServiceImpl();

    @Autowired
    public IUserService userService = new UserServiceImpl();

    @Value("${file.upload-dir}")
    private String baseUploadDir;

    @Value("${podcast.video.base-path}")
    private String videoBasePath;

    @Autowired
    private IFFmpegService ffmpegService;

    @Autowired
    private IUploadFileService uploadFileService;

    @Autowired
    private IGenreService genreService;

    private static final Logger logger = Logger.getLogger(PodcastController.class.getName());

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createPodcast(
            @RequestPart("title") String title,
            @RequestPart("content") String content,
            @RequestPart("video") MultipartFile videoFile,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestParam(value = "genreIds") List<String> genreIds) {
        try {
            validateCreatePodcastInfo(genreIds, videoFile);

            UserModel userModel = userService.getUserByToken();

            // Create user-specific directory
            Path userPodcastDir = FileUtils.createUserDirectory(baseUploadDir, userModel.getId(), userModel.getEmail(), "podcast");
            Path userThumbnailDir = FileUtils.createUserDirectory(baseUploadDir, userModel.getId(), userModel.getEmail(), "thumbnail");

            // Format fileName
            String formattedVideoFileName = FileUtils.formatFileName(videoFile.getOriginalFilename());

            // Save video temporarily
            Path videoPath = userPodcastDir.resolve(formattedVideoFileName);
            videoFile.transferTo(videoPath.toFile());

            // For ffmpeg
            String thumbnailUrl = null;

            if (thumbnail != null && !thumbnail.isEmpty()) {
                // Resize & Upload thumbnail lên Cloudinary
                thumbnailUrl = processAndUploadThumbnail(thumbnail, userThumbnailDir);
            } else if (thumbnail == null || thumbnail.isEmpty()) {
                // Tạo đường dẫn lưu thumbnail tạm thời
                String tempThumbnailFileName = "thumb_" + formattedVideoFileName.replace(".mp4", ".jpeg");
                Path tempThumbnailPath = userThumbnailDir.resolve(tempThumbnailFileName);

                // Sử dụng FFmpeg để capture frame đầu tiên
                ffmpegService.captureFrameFromVideo(videoPath.toString(), tempThumbnailPath.toString());

                // Resize về đúng tỉ lệ 16:9
                Path resizedThumbnailPath = userThumbnailDir.resolve("resized_" + tempThumbnailFileName);
                ffmpegService.resizeImageTo16by9(tempThumbnailPath.toString(), resizedThumbnailPath.toString());

                // Upload frame đã capture lên Cloudinary
                thumbnailUrl = uploadFileService.uploadImageBytes(FileUtils.encodeFileToBase64(resizedThumbnailPath.toFile()));
            }

            long duration = ffmpegService.getVideoDuration(videoPath.toString());

            CreatePodcastModel createPodcastModel = new CreatePodcastModel(title, content, videoPath.toString(), thumbnailUrl, genreIds, duration);

            // Call service and pass video file path
            PodcastModel podcastModel = podcastService.createPodcast(createPodcastModel, userModel.getId());

            return ResponseEntity.ok(podcastModel);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

    @PutMapping(value = "/edit/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PodcastModel> updatePodcast(
            @PathVariable("id") String id,
            @RequestPart(value = "title", required = false) String title,
            @RequestPart(value = "content", required = false) String content,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestParam(value = "genreIds", required = false) List<String> genreIds) {
        try {
            // Kiểm tra số lượng genre
            if (genreIds.size() > 5) {
                throw new Exception("A podcast can have at most 5 genres");
            }

            EditPodcastDTO editPodcastDTO = new EditPodcastDTO();
            editPodcastDTO.setTitle(title);
            editPodcastDTO.setContent(content);
            editPodcastDTO.setGenresId(genreIds);

            // Nếu có thumbnail, gán vào DTO
            if (thumbnail != null && !thumbnail.isEmpty()) {
                String thumbnailUrl = uploadFileService.uploadImage(thumbnail);
                editPodcastDTO.setThumbnailPath(thumbnailUrl);
            }

            PodcastModel updatedPodcast = podcastService.updatePodcast(id, editPodcastDTO);

            return ResponseEntity.ok(updatedPodcast);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/contents")
    public ResponseEntity<?> getAllSelfPodcasts(
            @RequestParam(defaultValue = "0") int page, // Số trang
            @RequestParam(defaultValue = "10") int size, // Số phần tử mỗi trang
            @RequestParam(required = false) Integer minViews, // Lọc theo số lượng view tối thiểu
            @RequestParam(required = false) Integer minComments, // Lọc theo số lượng comment tối thiểu
            @RequestParam(required = false, defaultValue = "asc") String sortByViews, // Sắp xếp view tăng/giảm dần
            @RequestParam(required = false, defaultValue = "asc") String sortByComments, // Sắp xếp comment tăng/giảm dần
            @RequestParam(required = false, defaultValue = "desc") String sortByCreatedDay // Sắp xếp theo ngày tạo tăng/giảm dần
    ) {
        try {
            PageDTO<PodcastModel> podcasts = podcastService.getAllSelfPodcasts(page, size, minViews, minComments,
                    sortByViews, sortByComments, sortByCreatedDay);

            return ResponseEntity.ok(podcasts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/video")
    public ResponseEntity<Resource> getVideo(@RequestParam String path, HttpServletRequest request, @RequestHeader(value = "Referer", required = false) String referer, @RequestHeader(value = "X-Mobile-App", required = false) String mobileApp) {
        try {
            // Kiểm tra nguồn gốc yêu cầu
//            if ((referer == null || (!referer.startsWith("http://localhost:5000") && !referer.startsWith("https://castifyapp.vercel.app/")&& !referer.startsWith("http://14.225.198.232")&& !referer.startsWith("https://14.225.198.232"))) && mobileApp == null ) {
//                logger.warning("Invalid referer: " + referer);
//                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//            }

            Path filePath = Paths.get(videoBasePath).resolve(path).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            long fileLength = resource.getFile().length();
            String range = request.getHeader("Range");

            if (range != null) {
                // Parse Range Header
                long start = 0, end = fileLength - 1;
                String[] ranges = range.replace("bytes=", "").split("-");
                if (!ranges[0].isEmpty()) start = Long.parseLong(ranges[0]);
                if (ranges.length > 1 && !ranges[1].isEmpty()) end = Long.parseLong(ranges[1]);

                if (start > end || end >= fileLength) {
                    return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                            .header("Content-Range", "bytes */" + fileLength)
                            .build();
                }

                long contentLength = end - start + 1;

                // Trả về luồng dữ liệu
                InputStream inputStream = Files.newInputStream(filePath);
                inputStream.skip(start);

                return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                        .header(HttpHeaders.CONTENT_TYPE, "video/mp4")
                        .header(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + fileLength)
                        .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                        .contentLength(contentLength)
                        .body(new InputStreamResource(inputStream));
            } else {
                // Trả về toàn bộ file nếu không có header "Range"
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_TYPE, "video/mp4")
                        .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                        .contentLength(fileLength)
                        .body(resource);
            }
        } catch (Exception e) {
            logger.severe("Error serving video: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPodcastByAuthUser(@PathVariable String id) {
        try {
            PodcastModel podcastModel = podcastService.getPodcastById(id);
            return ResponseEntity.ok(podcastModel);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<?> getDetailPodcastBySelf(@PathVariable String id) {
        try {
            PodcastModel podcastModel = podcastService.getPodcastBySelf(id);
            return ResponseEntity.ok(podcastModel);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/anonymous/{id}")
    public ResponseEntity<?> getPodcastByAnonymous(@PathVariable String id) {
        try {
            PodcastModel podcastModel = podcastService.getPodcastByIdAnonymous(id);
            return ResponseEntity.ok(podcastModel);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/reaction")
    public ResponseEntity<?> addReaction(@RequestBody LikePodcastDTO likePodcastDTO) {
        try {
            String result = podcastService.toggleLikeOnPodcast(likePodcastDTO.getPodcastId());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }
    @ExceptionHandler(MalformedJwtException.class)
    public ResponseEntity<String> handleMalformedJwtException(MalformedJwtException ex) {
        return new ResponseEntity<>("Invalid JWT token format", HttpStatus.BAD_REQUEST);
    }

    

    // Display podcast on home page
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentPodcasts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            PageDTO<PodcastModel> recentPodcasts = podcastService.getRecentPodcasts(page, size);
            return ResponseEntity.ok(recentPodcasts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/popular")
    public ResponseEntity<?> getPopularPodcasts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            PageDTO<PodcastModel> recentPodcasts = podcastService.getPopularPodcasts(page, size);
            return ResponseEntity.ok(recentPodcasts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/following")
    public ResponseEntity<?> getPodcastsFromFollowing(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            PageDTO<PodcastModel> podcasts = podcastService.getPodcastsFromFollowing(page, size);
            return ResponseEntity.ok(podcasts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/by-genre")
    public ResponseEntity<?> getPodcastsByGenre(
            @RequestParam(required = true) String genreId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            PageDTO<PodcastModel> podcastsByGenre = podcastService.getPodcastsByGenre(genreId, page, size);
            return ResponseEntity.ok(podcastsByGenre);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/suggested-by-genres/{id}")
    public ResponseEntity<PageDTO<PodcastModel>> getSuggestedPodcastsByGenres(
            @PathVariable String id,
            @RequestParam List<String> genreIds,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            PageDTO<PodcastModel> result = podcastService.getSuggestedPodcastsByGenres(genreIds, id, page, size);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/{id}/inc-views")
    public ResponseEntity<Void> incrementViews(@PathVariable String id) {
        podcastService.incrementPodcastViews(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<PageDTO<PodcastModel>> getUserPodcasts(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "newest") String sortBy
    ) {
        try {
            PageDTO<PodcastModel> result = podcastService.getUserPodcasts(username, page, size, sortBy);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/toggle")
    public ResponseEntity<?> togglePodcasts(@RequestBody List<String> podcastIds) {
        try {
            podcastService.togglePodcastDisplayMode(podcastIds);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deletePodcasts(@RequestBody List<String> podcastIds) {
        try {
            UserEntity currentUser = userService.getUserByAuthentication();

            // Kiem tra quyen admin
            boolean isAdmin = currentUser.getRole() == Role.ADMIN;

            podcastService.deletePodcastsByIds(podcastIds, isAdmin);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/trending")
    public ResponseEntity<PageDTO<PodcastModel>> getTrendingPodcasts(@RequestParam(value = "page", defaultValue = "0") int page,
                                                                     @RequestParam(value = "size", defaultValue = "10") int size) {
        PageDTO<PodcastModel> trending = podcastService.getTrendingPodcasts(page, size);
        return ResponseEntity.ok(trending);
    }

    @GetMapping("/following/{username}")
    public ResponseEntity<PageDTO<PodcastModel>> getPodcasts(@PathVariable("username") String username,
                                                             @RequestParam(value = "page", defaultValue = "0") int page,
                                                             @RequestParam(value = "size", defaultValue = "10") int size) {
        PageDTO<PodcastModel> podcasts = podcastService.getFollowingPodcastsByUsername(username, page, size);
        return ResponseEntity.ok(podcasts);
    }

    private void validateCreatePodcastInfo(List<String> genreIds, MultipartFile videoFile) {
        // Kiểm tra số lượng genre
        if (genreIds.size() > 5) {
            throw new RuntimeException("A podcast can have at most 5 genres");
        }

        // Check if null
        if (videoFile == null || videoFile.isEmpty()) {
            throw new RuntimeException("Empty video file");
        }

        // Validate file type
        String fileType = videoFile.getContentType();
        if (!fileType.equals("video/mp4") && !fileType.equals("video/x-msvideo") && !fileType.equals("video/x-matroska")) {
            throw new RuntimeException("Unsupported video format");
        }

        // Kiểm tra kích thước tệp
        if (videoFile.getSize() > 1024L * 1024L * 1024L) { // 1GB size limit
            throw new RuntimeException("File size exceeds limit of 1GB");
        }
    }

    public String processAndUploadThumbnail(MultipartFile originalThumbnail, Path userDir) throws IOException, InterruptedException {
        // Save original to temp file
        Path originalPath = userDir.resolve("original_thumbnail.jpeg");
        originalThumbnail.transferTo(originalPath.toFile());

        // Resize to 16:9
        Path resizedPath = userDir.resolve("resized_thumbnail.jpeg");
        ffmpegService.resizeImageTo16by9(originalPath.toString(), resizedPath.toString());

        // Upload resized image
        return uploadFileService.uploadImageBytes(FileUtils.encodeFileToBase64(resizedPath.toFile()));
    }
}
