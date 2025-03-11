package com.castify.backend.service.notification;

import com.castify.backend.entity.NotificationEntity;
import com.castify.backend.entity.UserEntity;
import com.castify.backend.enums.NotiType;
import com.castify.backend.models.notification.NotifiModel;
import com.castify.backend.models.notification.ReturnNumber;
import com.castify.backend.models.paginated.PaginatedResponse;
import com.castify.backend.repository.NotificationRepository;
import com.castify.backend.service.user.IUserService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationServiceImpl implements INotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    @Lazy
    private IUserService userService; // Xóa việc khởi tạo thủ công

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private ModelMapper modelMapper;

    @Override
    public void saveNotification(String receiverId, NotiType type, String title, String content, String url) throws Exception {
        UserEntity sender = userService.getUserByAuthentication(); // Sử dụng userService đã được inject
//        if(receiverId.equals(sender.getId()))
//            return; // Ngan gui thong bao cho ban than
        NotificationEntity notificationEntity = new NotificationEntity();
        notificationEntity.setSender(sender);
        notificationEntity.setReceiverId(receiverId);
        notificationEntity.setType(type);
        notificationEntity.setTitle(title);
        notificationEntity.setContent(content);
        notificationEntity.setTargetUrl(url);
        NotificationEntity savedNoti = notificationRepository.save(notificationEntity);
        messagingTemplate.convertAndSendToUser(
                receiverId,
                "/queue/notification",
                modelMapper.map(savedNoti, NotifiModel.class)
        );
    }

    @Override
    public PaginatedResponse<NotifiModel> getNotiByUser(int pageNumber, int pageSize) throws Exception {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(pageNumber,pageSize,sort);
        UserEntity currentUser = userService.getUserByAuthentication();
        Page<NotificationEntity> notis = notificationRepository.getNotificationEntitiesByReceiverId(currentUser.getId(),pageable);
        List<NotifiModel> returnData = notis.getContent().stream().map(noti -> modelMapper.map(noti, NotifiModel.class)).toList();
        return new PaginatedResponse<>(returnData,notis.getTotalPages());
    }
    @Override
    public ReturnNumber getTotalUnreadNotifications() throws Exception {
        UserEntity userEntity = userService.getUserByAuthentication();
        return new ReturnNumber(notificationRepository.countByReceiverIdAndReadIsFalse(userEntity.getId()));
    }
    @Override
    public void readNotifi(String notiId) throws Exception {
        UserEntity userEntity = userService.getUserByAuthentication();
        NotificationEntity noti = notificationRepository.getNotificationEntityById(notiId);
        if(!noti.getReceiverId().equals(userEntity.getId()))
        {
            throw new Exception("You don't have permission to do this action!");
        }
        noti.setRead(true);
        notificationRepository.save(noti);
    }
    @Override
    public void makeReadAll() throws Exception{
        UserEntity userEntity = userService.getUserByAuthentication();
        List<NotificationEntity> unreadNotis = notificationRepository.getNotificationEntitiesByReceiverIdAndReadIsFalse(userEntity.getId());

        unreadNotis.forEach(noti -> noti.setRead(true));
        notificationRepository.saveAll(unreadNotis);
    }
}
