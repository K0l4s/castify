package com.castify.backend.controller;

import com.castify.backend.models.genre.CreateGenreDTO;
import com.castify.backend.models.genre.GenreModel;
import com.castify.backend.models.genre.GenreSimple;
import com.castify.backend.models.genre.GenreUsageCount;
import com.castify.backend.service.genre.IGenreService;
import com.castify.backend.service.podcast.IPodcastService;
import com.castify.backend.service.podcast.PodcastServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/genre")
public class GenreController {
    @Autowired
    private IGenreService genreService;
    @Autowired
    private IPodcastService podcastService;
    @Autowired
    private PodcastServiceImpl podcastServiceImpl;

    @GetMapping("/names")
    public ResponseEntity<?> getAllGenresName() {
        try {
            List<GenreSimple> genres = genreService.getAllGenreName();
            return new ResponseEntity<>(genres, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getGenreById(@PathVariable String id) {
        try {
            GenreSimple genre = genreService.getGenreById(id);
            return new ResponseEntity<>(genre, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/namesByList")
    public ResponseEntity<?> getGenreNamesByList(@RequestBody List<String> genreIds) {
        try {
            List<GenreSimple> genres = genreService.getGenresByIds(genreIds);
            return new ResponseEntity<>(genres, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllGenres() {
        try {
            List<GenreModel> genres = genreService.getALlGenre();
            return new ResponseEntity<>(genres, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createGenre(@ModelAttribute CreateGenreDTO createGenreDTO) {
        try {
            GenreModel genreModel = genreService.createGenre(
                createGenreDTO.getName(), 
                createGenreDTO.getImage(), 
                createGenreDTO.getColor(),
                createGenreDTO.getTextColor()
            );
            return new ResponseEntity<>(genreModel, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateGenre(@PathVariable String id, @ModelAttribute CreateGenreDTO createGenreDTO) {
        try {
            GenreModel updateGenre = genreService.updateGenre(
                id, 
                createGenreDTO.getName(), 
                createGenreDTO.getImage(), 
                createGenreDTO.getColor(),
                createGenreDTO.getTextColor()
            );
            return new ResponseEntity<>(updateGenre, HttpStatus.OK);
        } catch (ResourceNotFoundException e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @PutMapping("/delete/{id}")
    public ResponseEntity<?> deleteGenre(@PathVariable String id) {
        try {
            String res = genreService.deleteGenre(id);
            return new ResponseEntity<>(res, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/countActiveGenres")
    public ResponseEntity<?> countActiveGenres() {
        try {
            // Gọi phương thức countActiveGenres từ service
            long count = genreService.countActiveGenres();
            return new ResponseEntity<>(count, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/usage-count")
    public ResponseEntity<List<GenreUsageCount>> getGenreUsageCount() {
        List<GenreUsageCount> genreUsageCounts = genreService.countGenreUsage();
        return ResponseEntity.ok(genreUsageCounts);
    }
}
