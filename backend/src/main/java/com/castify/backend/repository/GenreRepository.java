package com.castify.backend.repository;

import com.castify.backend.entity.GenreEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GenreRepository extends MongoRepository<GenreEntity, String> {
}
