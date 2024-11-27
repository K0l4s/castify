package com.castify.backend.service.ffmpeg;

import java.io.IOException;

public interface IFFmpegService {
    String addThumbnailToVideo(String videoPath, String thumbnailPath, String outputPath) throws IOException, InterruptedException;
}
