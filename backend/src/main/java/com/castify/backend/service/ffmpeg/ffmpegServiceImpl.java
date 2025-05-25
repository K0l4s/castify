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

    @Override
    public String captureFrameFromVideo(String videoPath, String outputImagePath) throws IOException, InterruptedException {
        // Build FFmpeg command to capture the first frame
        ProcessBuilder processBuilder = new ProcessBuilder(
                "ffmpeg",
                "-i", videoPath,
                "-vf", "thumbnail,scale=320:-1", // Capture the first frame and scale it
                "-frames:v", "1", // Only 1 frame
                outputImagePath
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

        return outputImagePath;
    }

    @Override
    public long getVideoDuration(String videoPath) {
        try {
            ProcessBuilder processBuilder = new ProcessBuilder(
                    "ffprobe",
                    "-i", videoPath,
                    "-show_entries", "format=duration",
                    "-v", "quiet",
                    "-of", "csv=p=0"
            );
            processBuilder.redirectErrorStream(true);

            Process process = processBuilder.start();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line = reader.readLine();
                if (line != null) {
                    return Math.round(Double.parseDouble(line)); // Convert duration to seconds
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to get video duration: " + e.getMessage(), e);
        }
        return 0;
    }

    @Override
    public void resizeImageTo16by9(String inputImagePath, String outputImagePath) throws IOException, InterruptedException {
        ProcessBuilder processBuilder = new ProcessBuilder(
                "ffmpeg",
                "-i", inputImagePath,
                "-vf", "scale=iw:-1,crop=trunc(in_h*16/9):in_h",
                "-y", // overwrite
                outputImagePath
        );

        processBuilder.redirectErrorStream(true);
        Process process = processBuilder.start();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            while (reader.readLine() != null);
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new IOException("Failed to resize image to 16:9 using FFmpeg.");
        }
    }
}
