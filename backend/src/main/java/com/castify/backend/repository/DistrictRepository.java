package com.castify.backend.repository;

import com.castify.backend.entity.location.DistrictEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface DistrictRepository extends MongoRepository<DistrictEntity,String> {

    List<DistrictEntity> findAllByCity_Id(String city_id);
}
