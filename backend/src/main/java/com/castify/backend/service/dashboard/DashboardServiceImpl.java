package com.castify.backend.service.dashboard;

import com.castify.backend.entity.UserEntity;
import com.castify.backend.models.dashboard.OverviewModel;
import com.castify.backend.models.user.BasicUserModel;
import com.castify.backend.repository.template.DashboardTemplate;
import com.castify.backend.service.user.IUserService;
import com.castify.backend.service.user.UserServiceImpl;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements IDashboardService{
    @Autowired
    private DashboardTemplate dashboardTemplate;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private IUserService userService = new UserServiceImpl();
    @Override
    public OverviewModel getOverviewInformation(LocalDateTime start, LocalDateTime end){
        Map<String,Object> overviewTempl = dashboardTemplate.getDashboardStatistics(start,end);

        OverviewModel overviewModel = modelMapper.map(overviewTempl,OverviewModel.class);

        List<UserEntity> userSimilars = (List<UserEntity>) overviewTempl.get("newUsers");
        List<BasicUserModel> newUsers = userSimilars.stream()
                .map(user -> userService.mapToBasicUser(user)).collect(Collectors.toList());

        overviewModel.setNewUsers(newUsers);
        return overviewModel;
    }
}
