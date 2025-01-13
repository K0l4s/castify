import { useEffect, useState } from 'react';
import useStomp from '../../hooks/useStomp';
import Tooltip from '../UI/custom/Tooltip';
import { IoIosNotifications } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { NotificationService } from '../../services/NotificationService';
import { setTotalUnRead } from '../../redux/slice/notificationSlice';
import { NotiModel } from '../../models/Notification';

const NotificationIcon = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotiModel[]>([]);
    const totalUnRead = useSelector((state: RootState) => state.Notification.totalUnRead);

    useEffect(() => {
        const fetchTotalUnread = async () => {
            const data = await NotificationService.getTotalUnRead();
            dispatch(setTotalUnRead(data.data.total));
        };
        fetchTotalUnread();
    }, [user, dispatch]);

    const stomp = useStomp({
        subscribeUrl: `/user/${user?.id}/queue/notification`,
        trigger: [],
    });

    useEffect(() => {
        if (stomp) {
            console.log(stomp);
        }
    }, [stomp]);

    useEffect(() => {
        const fetchNotifications = async () => {
            const data = await NotificationService.getAllNotification(0, 5);
            setNotifications(data.data.data);
        };
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    return (
        <div className='relative flex'>
            <Tooltip text="Notifications">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative p-2 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {totalUnRead > 0 && (
                        <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                            {totalUnRead}
                        </span>
                    )}
                    <IoIosNotifications className="w-5 h-5" />
                </button>
            </Tooltip>
            {isOpen && (
                <div className="absolute top-5 right-0 mt-2 w-96 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                            Thông báo
                        </h3>
                        <ul className="mt-2 space-y-2">
                            {notifications.map((noti) => (
                                <li
                                    key={noti.id}
                                    className="p-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                        {noti.title}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {noti.content}
                                    </p>
                                    <a
                                        href={noti.targetUrl}
                                        className="text-sm text-blue-500 hover:underline"
                                    >
                                        Xem chi tiết
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationIcon;
