package com.castify.backend.service.frame;

import com.castify.backend.entity.FrameEventEntity;

import java.time.LocalDateTime;
import java.util.List;

public interface IFrameEventService {
    //Create frame event function
    FrameEventEntity createFrameEvent(FrameEventEntity frameEntity);

    //    Get all event
    List<FrameEventEntity> searchFrameEvent(
            String keyword,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Boolean active,
            Integer pageNumber,
            Integer pageSize);

    FrameEventEntity getActiveFrameEvent();

    FrameEventEntity toggleActiveFrameEvent(String id);
}
