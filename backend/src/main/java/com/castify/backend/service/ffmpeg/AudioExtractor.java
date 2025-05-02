package com.castify.backend.service.ffmpeg;

import java.io.IOException;

public class AudioExtractor {
    public static void extractAudio(String videoPath, String audioPath) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg", "-i", videoPath, "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", audioPath
        );
        pb.inheritIO(); // để log ra console
        Process process = pb.start();
        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("FFmpeg failed with exit code: " + exitCode);
        }
    }
}
