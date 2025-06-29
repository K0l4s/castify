package com.castify.backend.service.notification;

import com.castify.backend.enums.NotiType;
import com.castify.backend.models.notification.NotifiModel;
import com.castify.backend.models.notification.ReturnNumber;
import com.castify.backend.models.paginated.PaginatedResponse;

public interface INotificationService {
    void saveNotification(String receiverId, NotiType type, String title, String content, String url) throws Exception;

    void saveNotificationNonSender(String receiverId, NotiType type, String title, String content, String url) throws Exception;

    PaginatedResponse<NotifiModel> getNotiByUser(int pageNumber, int pageSize) throws Exception;

    ReturnNumber getTotalUnreadNotifications() throws Exception;

    void readNotifi(String notiId) throws Exception;

    void makeReadAll() throws Exception;

    void deleteNoti(String notiId) throws Exception;

    void deleteAll() throws Exception;
}
