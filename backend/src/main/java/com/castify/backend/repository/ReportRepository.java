package com.castify.backend.repository;

import com.castify.backend.entity.ReportEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository  extends MongoRepository<ReportEntity,String> {
}
