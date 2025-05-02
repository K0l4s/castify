package com.castify.backend.service.ffmpeg;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.OutputStream;
import java.io.InputStream;

public class WhisperClient {
    public static String sendAudio(String filePath) throws IOException {
        String boundary = Long.toHexString(System.currentTimeMillis());
        String CRLF = "\r\n";
        URL url = new URL("http://localhost:5001/transcribe");
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setDoOutput(true);
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

        try (OutputStream output = connection.getOutputStream()) {
            File audioFile = new File(filePath);
            String fileName = audioFile.getName();

            // Gửi form data
            output.write(("--" + boundary + CRLF).getBytes());
            output.write(("Content-Disposition: form-data; name=\"file\"; filename=\"" + fileName + "\"" + CRLF).getBytes());
            output.write(("Content-Type: audio/wav" + CRLF).getBytes());
            output.write(CRLF.getBytes());
            Files.copy(audioFile.toPath(), output);
            output.write(CRLF.getBytes());
            output.write(("--" + boundary + "--" + CRLF).getBytes());
        }

        // Đọc response
        int responseCode = connection.getResponseCode();
        if (responseCode == HttpURLConnection.HTTP_OK) {
            InputStream responseStream = connection.getInputStream();
            return new String(responseStream.readAllBytes());
        } else {
            throw new IOException("Server returned non-OK status: " + responseCode);
        }
    }
}
