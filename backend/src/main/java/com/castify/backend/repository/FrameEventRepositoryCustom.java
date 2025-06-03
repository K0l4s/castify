package com.castify.backend.repository;

import com.castify.backend.entity.FrameEventEntity;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;

public interface FrameEventRepositoryCustom {
    Page<FrameEventEntity> searchFrameEvents(
            String keyword,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Boolean active,
            int pageNumber,
            int pageSize);
}
