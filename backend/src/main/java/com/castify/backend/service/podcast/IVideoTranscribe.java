package com.castify.backend.service.podcast;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;

public interface IVideoTranscribe {
    //    @PostMapping("/transcribe")
    ResponseEntity<?> transcribeVideo(File videoFile, String podcastId);
}
