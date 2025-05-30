package com.castify.backend.models.genre;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateGenreDTO {
    private String name;
    private MultipartFile image;
    private String color;
}
