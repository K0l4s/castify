package com.castify.backend.service.ffmpeg;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

@Service
public class ffmpegServiceImpl implements IFFmpegService {
    @Override
    public String addThumbnailToVideo(String videoPath, String thumbnailPath, String outputPath) throws IOException, InterruptedException {
        // Build FFmpeg command
        ProcessBuilder processBuilder = new ProcessBuilder(
                "ffmpeg",
                "-i", videoPath,
                "-i", thumbnailPath,
                "-map", "0",
                "-map", "1",
                "-c", "copy",
                "-disposition:v:1", "attached_pic",
                outputPath
        );

        processBuilder.redirectErrorStream(true); // Redirect FFmpeg output to standard output
        Process process = processBuilder.start();

        // Capture FFmpeg logs
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new IOException("FFmpeg process failed with exit code " + exitCode);
        }

        return outputPath;
    }
}
