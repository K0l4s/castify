package com.castify.backend.repository;

import com.castify.backend.entity.SearchHistoryEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SearchHistoryRepository extends MongoRepository<SearchHistoryEntity,String> {
}
