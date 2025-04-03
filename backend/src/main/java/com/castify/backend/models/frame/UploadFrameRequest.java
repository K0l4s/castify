package com.castify.backend.models.frame;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UploadFrameRequest {
    private String name;
    private Integer price;
    private MultipartFile imageFile;
}
