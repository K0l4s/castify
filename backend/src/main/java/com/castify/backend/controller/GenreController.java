package com.castify.backend.controller;

import com.castify.backend.models.genre.CreateGenreDTO;
import com.castify.backend.models.genre.GenreModel;
import com.castify.backend.models.genre.GenreSimple;
import com.castify.backend.service.genre.IGenreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/genre")
public class GenreController {
    @Autowired
    private IGenreService genreService;

    @GetMapping("/names")
    public ResponseEntity<?> getAllGenresName() {
        try {
            List<GenreSimple> genres = genreService.getAllGenreName();
            return new ResponseEntity<>(genres, HttpStatus.OK);
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
    public ResponseEntity<?> createGenre(@RequestBody CreateGenreDTO createGenreDTO) {
        try {
            GenreModel genreModel = genreService.createGenre(createGenreDTO.getName());
            return new ResponseEntity<>(genreModel, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateGenre(@PathVariable String id, @RequestBody CreateGenreDTO createGenreDTO) {
        try {
            GenreModel updateGenre = genreService.updateGenre(id, createGenreDTO.getName());
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
}
