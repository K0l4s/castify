package com.castify.backend.service.report;

import com.castify.backend.entity.ReportEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.models.report.ReportRequest;
import com.castify.backend.repository.ReportRepository;
import com.castify.backend.service.user.IUserService;
import com.castify.backend.service.user.UserServiceImpl;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ReportServiceImpl implements IReportService {
    @Autowired
    private ReportRepository reportRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private IUserService userService = new UserServiceImpl();
    @Override
    public String sendReport(ReportRequest request) throws Exception {
        ReportEntity reportEntity = new ReportEntity();
        reportEntity = modelMapper.map(request, ReportEntity.class);
        UserEntity requestUser = userService.getUserByAuthentication();
        reportEntity.setUserRequest(requestUser);
        reportRepository.save(reportEntity);
        return "Send Report Successfully";
    }

//    public getAllReportPending
}
