package com.castify.backend.service.genre;

import com.castify.backend.entity.GenreEntity;
import com.castify.backend.entity.PodcastEntity;
import com.castify.backend.models.genre.CreateGenreDTO;
import com.castify.backend.models.genre.GenreModel;
import com.castify.backend.models.genre.GenreSimple;
import com.castify.backend.models.genre.GenreUsageCount;
import com.castify.backend.repository.GenreRepository;
import com.castify.backend.repository.PodcastRepository;
import com.castify.backend.service.uploadFile.IUploadFileService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GenreServiceImpl implements IGenreService {
    @Autowired
    private GenreRepository genreRepository;

    @Autowired
    private PodcastRepository podcastRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private IUploadFileService uploadFileService;

    @Override
    public List<GenreSimple> getAllGenreName() {
        List<GenreEntity> genres = genreRepository.findAllActiveGenres();
        return genres.stream()
                .map(genreEntity -> modelMapper.map(genreEntity, GenreSimple.class))
                .toList();
    }

    @Override
    public GenreSimple getGenreById(String id) {
        GenreEntity genreEntity = genreRepository.findByIdAndIsActiveTrue(id);
        return modelMapper.map(genreEntity, GenreSimple.class);
    }

    @Override
    public List<GenreModel> getALlGenre() {
        List<GenreEntity> genres = genreRepository.findAll();
        return genres.stream()
                .map(genreEntity -> modelMapper.map(genreEntity, GenreModel.class))
                .toList();
    }

    @Override
    public GenreModel createGenre(String name, MultipartFile image) {
        return createGenre(name, image, null);
    }

    @Override
    public GenreModel createGenre(String name, MultipartFile image, String color) {
        return createGenre(name, image, color, "#ffffff");
    }

    @Override
    public GenreModel createGenre(String name, MultipartFile image, String color, String textColor) {
        GenreEntity genreEntity = new GenreEntity();
        genreEntity.setName(name);
        genreEntity.setActive(true);
        genreEntity.setLastEdited(LocalDateTime.now());

        if (image != null && !image.isEmpty()) {
            try {
                String imageUrl = uploadFileService.uploadImage(image);
                genreEntity.setImageUrl(imageUrl);
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload image: " + e.getMessage());
            }
        }

        genreEntity.setColor(color);
        genreEntity.setTextColor(textColor);

        genreRepository.save(genreEntity);
        return modelMapper.map(genreEntity, GenreModel.class);
    }

    @Override
    public GenreModel updateGenre(String id, String newName, MultipartFile imageFile) {
        return updateGenre(id, newName, imageFile, null, "#ffffff");
    }

    @Override
    public GenreModel updateGenre(String id, String newName, MultipartFile imageFile, String color) {
        return updateGenre(id, newName, imageFile, color, "#ffffff");
    }

    @Override
    public GenreModel updateGenre(String id, String newName, MultipartFile imageFile, String color, String textColor) {
        GenreEntity genreEntity = genreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Genre not found"));

        if (newName != null && !newName.isEmpty()) {
            genreEntity.setName(newName);
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String imageUrl = uploadFileService.uploadImage(imageFile);
                genreEntity.setImageUrl(imageUrl);
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload image: " + e.getMessage());
            }
        }

        if (color != null && !color.isEmpty()) {
            genreEntity.setColor(color);
        }

        if (textColor != null && !textColor.isEmpty()) {
            genreEntity.setTextColor(textColor);
        }

        genreEntity.setLastEdited(LocalDateTime.now());
        genreRepository.save(genreEntity);
        return modelMapper.map(genreEntity, GenreModel.class);
    }

    @Override
    public String deleteGenre(String id) {
        GenreEntity genreEntity = genreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Genre not found"));
        if (genreEntity.isActive()) {
            genreEntity.setActive(false);
            genreRepository.save(genreEntity);
            return "Genre deleted";
        }
        return "Genre not found";
    }

    @Override
    public List<GenreSimple> getGenresByIds(List<String> ids) {
        List<GenreEntity> genreEntities =  genreRepository.findAllById(ids);
        return genreEntities.stream()
                .map(genreEntity -> modelMapper.map(genreEntity, GenreSimple.class))
                .toList();
    }

    @Override
    public long countActiveGenres() {
        return genreRepository.countByIsActiveTrue();
    }

    @Override
    public List<GenreUsageCount> countGenreUsage() {
        List<GenreEntity> allGenres = genreRepository.findAll();
        List<PodcastEntity> podcasts = podcastRepository.findAllGenresInPodcasts();

        Map<String, Long> genreUsageMap = new HashMap<>();
        podcasts.forEach(podcast -> {
            podcast.getGenres().forEach(genre -> {
                genreUsageMap.put(genre.getId(), genreUsageMap.getOrDefault(genre.getId(), 0L) + 1);
            });
        });

        return allGenres.stream()
                .map(genre -> new GenreUsageCount(
                        genre.getId(),
                        genre.getName(),
                        genreUsageMap.getOrDefault(genre.getId(), 0L)
                ))
                .toList();
    }
}
