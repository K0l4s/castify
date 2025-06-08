package com.castify.backend.repository;

import com.castify.backend.entity.FrameEventEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FrameEventRepository extends MongoRepository<FrameEventEntity,String>  {
    @Query("{ '$and': [ " +
            "{ 'endDate': { $gt: ?0 } }, " + // endDate > startDate mới
            "{ 'startDate': { $lt: ?1 } } " + // startDate < endDate mới
            "] }")
    List<FrameEventEntity> findConflictingEvents(LocalDateTime newStartDate, LocalDateTime newEndDate);
    FrameEventEntity findFrameEventEntityById(String id);
    @Query("{ 'startDate': { $lte: ?0 }, 'endDate': { $gte: ?0 }, 'active': true }")
    FrameEventEntity findOngoingEvents(LocalDateTime now);
}
