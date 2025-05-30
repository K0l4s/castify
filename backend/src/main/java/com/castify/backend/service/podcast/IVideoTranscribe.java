package com.castify.backend.service.podcast;

import com.castify.backend.entity.TranscriptEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;

public interface IVideoTranscribe {
    //    @PostMapping("/transcribe")
    ResponseEntity<?> transcribeVideo(File videoFile, String podcastId);

    List<TranscriptEntity> getTranscripts(String podcastId);
}
