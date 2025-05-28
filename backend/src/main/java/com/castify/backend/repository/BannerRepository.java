package com.castify.backend.repository;

import com.castify.backend.entity.BannerEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends MongoRepository<BannerEntity,String> {
    List<BannerEntity> findAll();
}
