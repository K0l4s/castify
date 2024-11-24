package com.castify.backend.service.uploadFile;

import com.castify.backend.utils.FileUtils;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.Map;

@Service
public class UploadFileServiceImpl implements IUploadFileService{
    private final Cloudinary cloudinary;

    @Value("${file.upload-dir}")
    private String baseUploadDir;

    public UploadFileServiceImpl(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    //    @Override
    public String uploadImage(MultipartFile imageFile, String userId, String email, String subFolder) throws IOException {
        // Create user-specific directory
        String fileType = imageFile.getContentType().split("/")[0];

        if (!fileType.equals("image")) {
            throw new RuntimeException("Unsupported file format");
        }
        if (imageFile.getSize() > 1024L * 1024L * 1024L) { // 1GB size limit
            throw new RuntimeException("File size exceeds limit of 1GB");
        }
        Path userPodcastDir = FileUtils.createUserDirectory(baseUploadDir, userId,email, subFolder);

        // Format fileName
        String formattedFileName = FileUtils.formatFileName(imageFile.getOriginalFilename());

        // Save video temporarily
        Path imagePath = userPodcastDir.resolve(formattedFileName);
        imageFile.transferTo(imagePath.toFile());
        return imagePath.toString();
    }

    @Override
    public String uploadImage(MultipartFile imageFile) throws IOException {
        // Validate image file
        if (imageFile.isEmpty()) {
            throw new IllegalArgumentException("Image file is empty");
        }

        try {
            // Upload file to Cloudinary
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    imageFile.getBytes(),
                    ObjectUtils.emptyMap()
            );

            // Return the secure URL of the uploaded image
            return (String) uploadResult.get("secure_url");
        } catch (Exception e) {
            throw new IOException("Failed to upload image to Cloudinary", e);
        }
    }
}
