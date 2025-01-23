package com.castify.backend.service.genre;

import com.castify.backend.models.genre.GenreModel;
import com.castify.backend.models.genre.GenreSimple;
import com.castify.backend.models.genre.GenreUsageCount;

import java.util.List;

public interface IGenreService {
    List<GenreSimple> getAllGenreName();
    List<GenreModel> getALlGenre();
    GenreModel createGenre(String name);
    GenreModel updateGenre(String id, String newName);
    String deleteGenre(String id);
    List<GenreSimple> getGenresByIds(List<String> ids);
    long countActiveGenres();
    List<GenreUsageCount> countGenreUsage();
}
