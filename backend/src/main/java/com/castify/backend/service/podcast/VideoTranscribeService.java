package com.castify.backend.service.podcast;

import com.castify.backend.entity.TranscriptEntity;
import com.castify.backend.repository.TranscriptRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

//@RestController
//@RequestMapping("/api/v1/transcribe")
@Service
public class VideoTranscribeService implements IVideoTranscribe {

    private final String ffmpegPath = "ffmpeg"; // nếu là Windows: "C:\\ffmpeg\\bin\\ffmpeg.exe"
    @Value("${PYTHON_URL:http://localhost:5001}")
    private String flaskUrl;
    @Autowired
    private TranscriptRepository transcriptRepository;

    //    @PostMapping("/transcribe")
//    @Override
//    public ResponseEntity<?> transcribeVideo(File videoFile, String podcastId) {
//        File audioFile = null;
//
//        try {
//            // 1. Tạo file âm thanh tạm
//            audioFile = File.createTempFile("audio_", ".wav");
//
//            // 2. Tách âm thanh bằng ffmpeg
//            ProcessBuilder builder = new ProcessBuilder(
//                    ffmpegPath,
//                    "-i", videoFile.getAbsolutePath(),
//                    "-vn",
//                    "-acodec", "pcm_s16le",
//                    "-ar", "16000",
//                    "-ac", "1",
//                    audioFile.getAbsolutePath()
//            );
//            builder.inheritIO(); // hiện log ffmpeg nếu cần
//            Process process = builder.start();
//            int exitCode = process.waitFor();
//            if (exitCode != 0) {
//                throw new RuntimeException("FFmpeg failed with exit code: " + exitCode);
//            }
//
//            // 3. Gửi file âm thanh tới Flask server để transcribe
//            HttpHeaders headers = new HttpHeaders();
//            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
//
//            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
//            body.add("file", new FileSystemResource(audioFile));
//
//            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
//            RestTemplate restTemplate = new RestTemplate();
//
//            ResponseEntity<String> response = restTemplate.postForEntity(flaskUrl + "/transcribe", requestEntity, String.class);
//
//            // 4. Phân tích JSON response
//            ObjectMapper mapper = new ObjectMapper();
//            JsonNode json = mapper.readTree(response.getBody());
//            JsonNode segments = json.get("segments");
//
//            List<TranscriptEntity> transcripts = new ArrayList<>();
//            for (JsonNode segment : segments) {
//                double start = segment.get("start").asDouble();
//                double end = segment.get("end").asDouble();
//                String text = segment.get("text").asText();
//                transcripts.add(new TranscriptEntity(start, end, text, podcastId));
//            }
//
//            // 5. Lưu vào DB
//            transcriptRepository.saveAll(transcripts);
//            return ResponseEntity.ok(transcripts);
//
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResponseEntity.status(500).body("Lỗi xử lý video: " + e.getMessage());
//        } finally {
//            // 6. Xoá file tạm
//            if (audioFile != null && audioFile.exists()) audioFile.delete();
//        }
//    }
    @Override
    public ResponseEntity<?> transcribeVideo(File videoFile, String podcastId) {
        try {
            // 1. Gửi video gốc tới Flask endpoint /transcript
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new FileSystemResource(videoFile));

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            RestTemplate restTemplate = new RestTemplate();

            ResponseEntity<String> response = restTemplate.postForEntity(flaskUrl +  "/transcribe", requestEntity, String.class);

            // 2. Phân tích JSON response
            ObjectMapper mapper = new ObjectMapper();
            JsonNode json = mapper.readTree(response.getBody());
            JsonNode segments = json.get("segments");

            List<TranscriptEntity> transcripts = new ArrayList<>();
            for (JsonNode segment : segments) {
                double start = segment.get("start").asDouble();
                double end = segment.get("end").asDouble();
                String text = segment.get("text").asText();
                transcripts.add(new TranscriptEntity(start, end, text, podcastId));
            }

            // 3. Lưu vào DB
            transcriptRepository.saveAll(transcripts);
            return ResponseEntity.ok(transcripts);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi xử lý video: " + e.getMessage());
        }
    }

    @Override
    public List<TranscriptEntity> getTranscripts(String podcastId) {
        return transcriptRepository.findByPodcastId(podcastId);
    }


}

