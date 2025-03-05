package com.castify.backend.repository;

import com.castify.backend.entity.location.CityEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CityRepository extends MongoRepository<CityEntity,String> {
}
