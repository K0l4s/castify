package com.castify.backend.utils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

public class FileUtils {
    // Format file name
    public static String formatFileName(String originalName) {
        // Loai bo duoi file
        String fileExtension = "";
        int lastDotIndex = originalName.lastIndexOf(".");
        if (lastDotIndex > 0 && lastDotIndex < originalName.length() - 1) {
            fileExtension = originalName.substring(lastDotIndex); // Include the dot
            originalName = originalName.substring(0, lastDotIndex); // Remove the extension
        }

        // Chuan hoa ten, loai bo dau
        String normalized = Normalizer.normalize(originalName, Normalizer.Form.NFD);
        String noDiacritics = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        // Loai bo ky tu khong hop le
        String cleaned = noDiacritics.replaceAll("[^a-zA-Z0-9]", "");

        // Them datetime
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));

        return cleaned.toLowerCase() + "_" + timestamp + fileExtension;
    }

    // Create a directory for the user based on email and ID.
    public static Path createUserDirectory(String baseDir, String userId, String email, String subFolder) throws IOException {
        // Sanitize email for use in a directory name
        String sanitizedEmail = email.replaceAll("[^a-zA-Z0-9]", "_");

        // Construct the directory path
        Path userDir = Paths.get(baseDir, "user", sanitizedEmail + "_" + userId, subFolder);

        // Ensure the directory exists
        if (!Files.exists(userDir)) {
            Files.createDirectories(userDir);
        }
        return userDir;
    }

    public static byte[] encodeFileToBase64(File file) throws IOException {
        return org.apache.commons.io.FileUtils.readFileToByteArray(file);
    }

}