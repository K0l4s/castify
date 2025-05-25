package com.castify.backend.service.ffmpeg;

import java.io.IOException;

public interface IFFmpegService {
    String addThumbnailToVideo(String videoPath, String thumbnailPath, String outputPath) throws IOException, InterruptedException;
    String captureFrameFromVideo(String videoPath, String outputImagePath) throws IOException, InterruptedException;
    long getVideoDuration(String videoPath);
    void resizeImageTo16by9(String inputImagePath, String outputImagePath) throws IOException, InterruptedException;
}
