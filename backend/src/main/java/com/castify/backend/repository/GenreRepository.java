package com.castify.backend.repository;

import com.castify.backend.entity.GenreEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GenreRepository extends MongoRepository<GenreEntity, String> {
    GenreEntity findByIdAndIsActiveTrue(String id);
    @Query("{ 'isActive': true }")
    List<GenreEntity> findAllActiveGenres();
    @Query("{ '_id': { $in: ?0 } }")
    List<GenreEntity> findAllById(List<String> ids);
    long countByIsActiveTrue();
    List<GenreEntity> findByIsActiveTrue();
    List<GenreEntity> findByIdInAndIsActiveTrue(List<String> ids);
}
