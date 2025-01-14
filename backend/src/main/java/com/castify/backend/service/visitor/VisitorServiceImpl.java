package com.castify.backend.service.visitor;

import com.castify.backend.entity.VisitorEntity;
import com.castify.backend.models.visitor.VisitorModel;
import com.castify.backend.repository.VisitorLogRepository;
import com.castify.backend.service.user.IUserService;
import com.castify.backend.service.user.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class VisitorServiceImpl implements IVisitorService{
    @Autowired
    private VisitorLogRepository visitorRepository;
    @Autowired
    private IUserService userService = new UserServiceImpl();
    @Override
    public String trackVisitor(VisitorModel track){
        VisitorEntity visitor = new VisitorEntity();
        visitor.setUrl(track.getUrl());
        visitor.setUserAgent(track.getUserAgent());
        visitor.setAccessTime(LocalDateTime.now());
        visitorRepository.save(visitor);
        return "Visitor tracked successfully!";
    }
}
