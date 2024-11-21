package com.castify.backend.service.uploadFile;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface IUploadFileService {
    String uploadImage(MultipartFile imageFile, String userId, String email, String subFolder) throws IOException;
}