package com.castify.backend.service.notification;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.util.UUID;

@Service
public class VideoTranscodeService {

//    private static final String OUTPUT_DIR = "hls_output";

    public String transcodeToHLS(MultipartFile multipartFile, String outputDir) throws Exception {
        // Tạo thư mục output nếu chưa có
        File outDir = new File(outputDir);
        if (!outDir.exists()) outDir.mkdirs();

        // Lưu file tạm
        String videoId = UUID.randomUUID().toString();
        String inputFilePath = outputDir + "/" + videoId + "_input.mp4";
        File inputFile = new File(inputFilePath);
        multipartFile.transferTo(inputFile);

        // Tạo thư mục con cho output video
        File outputSubDir = new File(outputDir + "/" + videoId);
        if (!outputSubDir.exists()) outputSubDir.mkdirs();

        // FFmpeg command (1 dòng)
        String command = String.format(
                "ffmpeg -i %s -filter_complex \"[0:v]split=3[v1][v2][v3];" +
                        "[v1]scale=w=1920:h=1080[v1out];" +
                        "[v2]scale=w=1280:h=720[v2out];" +
                        "[v3]scale=w=854:h=480[v3out]\" " +
                        "-map \"[v1out]\" -map 0:a -c:v:0 libx264 -b:v:0 5000k -c:a:0 aac -b:a:0 128k " +
                        "-map \"[v2out]\" -map 0:a -c:v:1 libx264 -b:v:1 3000k -c:a:1 aac -b:a:1 128k " +
                        "-map \"[v3out]\" -map 0:a -c:v:2 libx264 -b:v:2 1500k -c:a:2 aac -b:a:2 128k " +
                        "-f hls -hls_time 6 -hls_playlist_type vod " +
                        "-hls_segment_filename \"%s/output_%%v_%%03d.ts\" -master_pl_name master.m3u8 " +
                        "-var_stream_map \"v:0,a:0 v:1,a:1 v:2,a:2\" %s/output_%%v.m3u8",
                inputFilePath, outputDir + "/" + videoId, outputDir + "/" + videoId
        );


        System.out.println("➡️ FFmpeg Command:\n" + command);

        long start = System.currentTimeMillis();
        ProcessBuilder pb = new ProcessBuilder("cmd.exe", "/c", command); // dùng cho Windows
        pb.redirectErrorStream(true); // gộp stderr vào stdout
        Process process = pb.start();

        // Đọc output FFmpeg
        StringBuilder outputLog = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println("🎬 FFmpeg: " + line);
                outputLog.append(line).append("\n");
            }
        }

        int exitCode = process.waitFor();
        long end = System.currentTimeMillis();

        System.out.println("✅ FFmpeg Exit Code: " + exitCode);
        System.out.println("⏱️ Processing Time: " + (end - start) + " ms");

        if (exitCode != 0) {
            throw new RuntimeException("FFmpeg failed with exit code " + exitCode + ":\n" + outputLog);
        }

        return outputDir + "/" + videoId + "/master.m3u8";
    }

}

