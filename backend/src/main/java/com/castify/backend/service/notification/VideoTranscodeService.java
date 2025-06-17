package com.castify.backend.service.notification;

import com.castify.backend.entity.PodcastEntity;
import com.castify.backend.models.podcast.SolutionModel;
import com.castify.backend.repository.PodcastRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.*;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class VideoTranscodeService {
    private final List<Integer> availableResolutions = Arrays.asList(360, 480, 720, 1080);
    @Autowired
    private PodcastRepository podcastRepository;
    public void transcodeVideo(String inputPath, String outputDir, String podcastId) throws IOException, InterruptedException {
        // 1. Lấy độ phân giải gốc
        int sourceHeight = getVideoHeight(inputPath);
        if (sourceHeight == -1) throw new RuntimeException("Không lấy được độ phân giải video.");
        PodcastEntity podcast = podcastRepository.findPodcastEntityById(podcastId);
        SolutionModel defaultSolution = new SolutionModel();
        defaultSolution.setSolution(sourceHeight);
        defaultSolution.setUrl(inputPath);
        podcast.getSolutionModelList().add(defaultSolution);
        // 2. Lọc danh sách cần tạo
        List<Integer> resolutionsToCreate = new ArrayList<>();
        for (int res : availableResolutions) {
            if (res < sourceHeight) {
                resolutionsToCreate.add(res);
            }
        }

        // 3. Tạo folder nếu chưa có
        File outDir = new File(outputDir);
        if (!outDir.exists()) outDir.mkdirs();

        // 4. Transcode từng bản
        for (int res : resolutionsToCreate) {
//            String formattedFileName = fileName.substring(lastDotIndex);
            String outputPath = outputDir + podcastId + "_" + res + "p.mp4";
            String scale = "-2:" + res;
            ProcessBuilder builder = new ProcessBuilder(
                    "ffmpeg",
                    "-i", inputPath,
                    "-vf", "scale=" + scale,
                    "-c:v", "libx264",
                    "-crf", "23",
                    "-preset", "veryfast",
                    "-c:a", "aac",
                    "-strict", "experimental",
                    outputPath
            );

            builder.redirectErrorStream(true);
            Process process = builder.start();

            // In log FFmpeg nếu muốn
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    System.out.println("[FFmpeg] " + line);
                }
            }


            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new RuntimeException("FFmpeg thất bại ở " + res + "p");
            }
            SolutionModel newSolution = new SolutionModel();
            newSolution.setUrl(outputPath);
            newSolution.setSolution(res);
            podcast.getSolutionModelList().add(newSolution);
        }
        podcastRepository.save(podcast);
    }

    private int getVideoHeight(String inputPath) throws IOException, InterruptedException {
        ProcessBuilder builder = new ProcessBuilder(
                "ffprobe",
                "-v", "error",
                "-select_streams", "v:0",
                "-show_entries", "stream=height",
                "-of", "csv=p=0",
                inputPath
        );

        Process process = builder.start();
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String line = reader.readLine();
        int exitCode = process.waitFor();

        if (exitCode != 0 || line == null) {
            return -1;
        }

        try {
            return Integer.parseInt(line.trim());
        } catch (NumberFormatException e) {
            return -1;
        }
    }
}

