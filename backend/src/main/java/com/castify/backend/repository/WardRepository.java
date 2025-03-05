package com.castify.backend.repository;

import com.castify.backend.entity.location.DistrictEntity;
import com.castify.backend.entity.location.WardEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
public interface WardRepository extends MongoRepository<WardEntity,String> {
    List<WardEntity> findAllByDistrict_Id(String districtId);
    WardEntity findWardEntityById(String id);
}
