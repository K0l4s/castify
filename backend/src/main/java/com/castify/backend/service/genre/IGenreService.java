package com.castify.backend.service.genre;

import com.castify.backend.models.genre.GenreModel;
import com.castify.backend.models.genre.GenreSimple;
import com.castify.backend.models.genre.GenreUsageCount;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IGenreService {
    List<GenreSimple> getAllGenreName();
    List<GenreModel> getALlGenre();
    GenreModel createGenre(String name, MultipartFile image);
    GenreModel createGenre(String name, MultipartFile image, String color);
    GenreModel updateGenre(String id, String newName, MultipartFile image);
    GenreModel updateGenre(String id, String newName, MultipartFile image, String color);
    String deleteGenre(String id);
    List<GenreSimple> getGenresByIds(List<String> ids);
    long countActiveGenres();
    List<GenreUsageCount> countGenreUsage();
}
