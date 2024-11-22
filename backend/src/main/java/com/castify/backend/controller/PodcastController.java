package com.castify.backend.controller;

import com.castify.backend.models.podcast.CreatePodcastModel;
import com.castify.backend.models.podcast.PodcastModel;
import com.castify.backend.models.user.UserModel;
import com.castify.backend.service.IUserService;
import com.castify.backend.service.UserServiceImpl;
import com.castify.backend.service.podcast.IPodcastService;
import com.castify.backend.service.podcast.PodcastServiceImpl;
import com.castify.backend.utils.FileUtils;
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
import java.util.Map;
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

    private static final Logger logger = Logger.getLogger(PodcastController.class.getName());

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createPodcast(
            @RequestPart("title") String title,
            @RequestPart("content") String content,
            @RequestPart("video") MultipartFile videoFile) {
        try {
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
            String formattedFileName = FileUtils.formatFileName(videoFile.getOriginalFilename());

            // Save video temporarily
            Path videoPath = userPodcastDir.resolve(formattedFileName);
            videoFile.transferTo(videoPath.toFile());

            CreatePodcastModel createPodcastModel = new CreatePodcastModel(title, content);

            // Call service and pass video file path
            PodcastModel podcastModel = podcastService.createPodcast(createPodcastModel, videoPath.toString());

            return ResponseEntity.ok(podcastModel);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
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
            Map<String, Object> podcasts = podcastService.getAllSelfPodcasts(page, size, minViews, minComments,
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
            if (referer == null || !referer.startsWith("http://localhost:5000")) { // Thay đổi URL theo ứng dụng của bạn
                logger.warning("Invalid referer: " + referer);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
            }

            Path filePath = Paths.get(videoBasePath).resolve(path).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
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
}
