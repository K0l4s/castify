package com.castify.backend.utils;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class FileUtils {
    public static String formatFileName(String originalName) {
        // Chuan hoa ten, loai bo dau
        String normalized = Normalizer.normalize(originalName, Normalizer.Form.NFD);
        String noDiacritics = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        // Loai bo ky tu khong hop le
        String cleaned = noDiacritics.replaceAll("[^a-zA-Z0-9]", "");

        // Them datetime
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));

        return cleaned.toLowerCase() + "_" + timestamp;
    }
}