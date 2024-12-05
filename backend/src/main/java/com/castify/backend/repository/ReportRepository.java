package com.castify.backend.repository;

import com.castify.backend.entity.ReportEntity;
import com.castify.backend.enums.ReportStatus;
import com.castify.backend.enums.ReportType;
import com.nimbusds.oauth2.sdk.ResponseType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository  extends MongoRepository<ReportEntity,String> {
    Page<ReportEntity> findAll(Pageable pageable);
    @Query("{'status': ?0, 'type': ?1, $or: [{'title': {$regex: ?2, $options: 'i'}}, {'detail': {$regex: ?3, $options: 'i'}}]}")
    Page<ReportEntity> findByStatusAndTypeAndTitleAndDetail(
            ReportStatus status,
            ReportType type,
            String title,
            String detail,
            Pageable pageable
    );
    @Query("{'status': ?0, 'type': ?1}")
    Page<ReportEntity> findByStatusAndType(
            ReportStatus status,
            ReportType type,
            Pageable pageable
    );
    @Query("{'status': ?0, $or: [{'title': {$regex: ?1, $options: 'i'}}, {'detail': {$regex: ?2, $options: 'i'}}]}")
    Page<ReportEntity> findByStatusAnKeyword(
            ReportStatus status,
            String title,
            String detail,
            Pageable pageable
    );

    @Query("{$or: [{'title': {$regex: ?0, $options: 'i'}}, {'detail': {$regex: ?1, $options: 'i'}}]}")
    Page<ReportEntity> findByKeyword(
            String title,
            String detail,
            Pageable pageable
    );

    @Query("{'type': ?0, $or: [{'title': {$regex: ?1, $options: 'i'}}, {'detail': {$regex: ?2, $options: 'i'}}]}")
    Page<ReportEntity> findByTypeAndKeyword(
            ReportType type,
            String title,
            String detail,
            Pageable pageable
    );
    Page<ReportEntity> findByStatus(ReportStatus status,Pageable pageable);
    Page<ReportEntity> findByType(ReportType type, Pageable pageable);
}
