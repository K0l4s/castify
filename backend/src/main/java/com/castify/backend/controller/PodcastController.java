package com.castify.backend.controller;

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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

            if (videoFile.getSize() > 1024L * 1024L * 1024L) { // 1GB size limit
                throw new RuntimeException("File size exceeds limit of 1GB");
            }

            UserModel userModel = userService.getUserByToken();

            // Create user-specific directory
            Path userPodcastDir = FileUtils.createUserDirectory(baseUploadDir, userModel.getId(), userModel.getEmail(), "podcast");

            // Format fileName
            String formattedVideoFileName = FileUtils.formatFileName(videoFile.getOriginalFilename());

            // Save video temporarily
            Path videoPath = userPodcastDir.resolve(formattedVideoFileName);
            videoFile.transferTo(videoPath.toFile());

            // For ffmpeg
            String thumbnailUrl = null;

            if (thumbnail != null && !thumbnail.isEmpty()) {
                // Upload thumbnail lên Cloudinary
                thumbnailUrl = uploadFileService.uploadImage(thumbnail);

            } else if (thumbnail == null || thumbnail.isEmpty()) {
                // Tạo đường dẫn lưu thumbnail tạm thời
                Path userThumbnailDir = FileUtils.createUserDirectory(baseUploadDir, userModel.getId(), userModel.getEmail(), "thumbnail");
                String tempThumbnailFileName = "thumb_" + formattedVideoFileName.replace(".mp4", ".jpeg");
                Path tempThumbnailPath = userThumbnailDir.resolve(tempThumbnailFileName);

                // Sử dụng FFmpeg để capture frame đầu tiên
                ffmpegService.captureFrameFromVideo(videoPath.toString(), tempThumbnailPath.toString());

                // Upload frame đã capture lên Cloudinary
                thumbnailUrl = uploadFileService.uploadImageBytes(FileUtils.encodeFileToBase64(tempThumbnailPath.toFile()));
            }

            CreatePodcastModel createPodcastModel = new CreatePodcastModel(title, content, videoPath.toString(), thumbnailUrl, genreIds);

            // Call service and pass video file path
            PodcastModel podcastModel = podcastService.createPodcast(createPodcastModel);

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
    public ResponseEntity<Resource> getVideo(@RequestParam String path, @RequestHeader(value = "Referer", required = false) String referer) {
        try {
            // Kiểm tra nguồn gốc yêu cầu
            if (referer == null || (!referer.startsWith("http://localhost:5000") && !referer.startsWith("https://castifyapp.vercel.app/"))) {
                logger.warning("Invalid referer: " + referer);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
            }

            Path filePath = Paths.get(videoBasePath).resolve(path).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType("video/mp4"))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
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

    @PostMapping("/{id}/inc-views")
    public ResponseEntity<Void> incrementViews(@PathVariable String id) {
        podcastService.incrementPodcastViews(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user")
    public ResponseEntity<PageDTO<PodcastModel>> getUserPodcasts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "newest") String sortBy
    ) {
        try {
            PageDTO<PodcastModel> result = podcastService.getUserPodcasts(page, size, sortBy);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/toggle/{id}")
    public ResponseEntity<?> togglePodcast(@PathVariable String id) {
        try {
            podcastService.togglePodcastDisplayMode(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
