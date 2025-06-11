package com.castify.backend.service.frame;

import com.castify.backend.entity.FrameEventEntity;
import com.castify.backend.repository.FrameEventRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;


@Service
public class FrameEventServiceImpl implements IFrameEventService {
    @Autowired
    private FrameEventRepository frameEventRepository;

    @Override
    //Create frame event function
    public FrameEventEntity createFrameEvent(FrameEventEntity frameEntity) {
        if (isEventTimeConflicted(frameEntity.getStartDate(), frameEntity.getEndDate())) {
            throw new IllegalArgumentException("Thời gian của sự kiện bị trùng với sự kiện khác!");
        }
        return frameEventRepository.save(frameEntity);
    }
    public boolean isEventTimeConflicted(LocalDateTime newStartDate, LocalDateTime newEndDate) {
        List<FrameEventEntity> conflicts = frameEventRepository.findConflictingEvents(newStartDate, newEndDate);
        return !conflicts.isEmpty(); // true nếu có trùng
    }

    @Autowired
    private MongoTemplate mongoTemplate;

    //    Get all event
    @Override
    public List<FrameEventEntity> searchFrameEvent(
            String keyword,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Boolean active,
            Integer pageNumber,
            Integer pageSize) {

        Query query = new Query();

        List<Criteria> criteriaList = new ArrayList<>();

        if (keyword != null && !keyword.trim().isEmpty()) {
            String regex = ".*" + Pattern.quote(keyword.trim()) + ".*";
            Criteria keywordCriteria = new Criteria().orOperator(
                    Criteria.where("name").regex(regex, "i"),
                    Criteria.where("description").regex(regex, "i")
            );
            criteriaList.add(keywordCriteria);
        }

        if (fromDate != null && toDate != null) {
            criteriaList.add(new Criteria().andOperator(
                    Criteria.where("endDate").gte(fromDate),
                    Criteria.where("startDate").lte(toDate)
            ));
        } else if (fromDate != null) {
            criteriaList.add(Criteria.where("endDate").gte(fromDate));
        } else if (toDate != null) {
            criteriaList.add(Criteria.where("startDate").lte(toDate));
        }


        if (active != null) {
            criteriaList.add(Criteria.where("active").is(active));
        }

        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        // Phân trang
        int page = (pageNumber != null && pageNumber >= 0) ? pageNumber : 0;
        int size = (pageSize != null && pageSize > 0) ? pageSize : 10;
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startDate"));
        query.with(pageable);

        return mongoTemplate.find(query, FrameEventEntity.class);
    }

    @Override
    public FrameEventEntity getActiveFrameEvent(){
        LocalDateTime now = LocalDateTime.now();
        return frameEventRepository.findOngoingEvents(now);
    }

    @Override
    public FrameEventEntity toggleActiveFrameEvent(String id){
        FrameEventEntity frame = frameEventRepository.findFrameEventEntityById(id);
        frame.setActive(!frame.isActive());
        return frameEventRepository.save(frame);
    }
}
