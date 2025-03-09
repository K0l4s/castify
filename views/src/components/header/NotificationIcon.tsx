import { useEffect, useState } from 'react';
import useStomp from '../../hooks/useStomp';
import Tooltip from '../UI/custom/Tooltip';
import { IoIosNotifications } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { NotificationService } from '../../services/NotificationService';
import { setTotalUnRead } from '../../redux/slice/notificationSlice';
import { NotiModel } from '../../models/Notification';
import { useNavigate } from 'react-router-dom';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';

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
            // console.log(stomp);
            dispatch(setTotalUnRead(totalUnRead + 1));
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
    const navigate = useNavigate();
    // const formatTime = (time: string) => {
    //     const date = new Date(time);
    //     return date.toLocaleString();
    // };
    const formatTimeCalculation = (time: string) => {
        const date = new Date(time);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days} ngày trước`;
        if (hours > 0) return `${hours} giờ trước`;
        if (minutes > 0) return `${minutes} phút trước`;
        return `${seconds} giây trước`;
    };
    const readNoti = async (id: string) => {
        await NotificationService.readNoti(id);
        // const data = await NotificationService.getTotalUnRead();
        dispatch(setTotalUnRead(totalUnRead - 1));

    };
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
                                    onClick={() => {
                                        readNoti(noti.id);
                                        noti.read = true;
                                        navigate(noti.targetUrl)
                                    }}
                                    className={`p-3 w-full rounded-lg hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-700 flex items-center justify-between ${!noti.read && 'bg-gray-200/10'}`}
                                >
                                    <div>
                                        <p className={`flex gap-1 text-sm font-medium text-gray-800 dark:text-gray-100 items-center`}>
                                            {noti.title}
                                            {/* thêm tag NEW nếu chưa xem */}
                                            {!noti.read && <div className='bg-red-500 p-1 rounded-lg text-[10px]'>
                                                NEW
                                                </div>}
                                            <p className="text-sm text-gray-600 dark:text-gray-400 text-right">
                                                {formatTimeCalculation(noti.createdAt)}
                                            </p>
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {noti.content}
                                        </p>

                                    </div>
                                    {/* nút 3 chấm */}
                                    <button
                                        onClick={(e) => {
                                            // xóa bỏ tác động của bên ngoài
                                            e.stopPropagation();
                                        }
                                        }
                                        className="relative p-2 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <HiOutlineDotsHorizontal className="w-5 h-5" />
                                    </button>
                                    {/* <Link
                                        to={noti.targetUrl}
                                        className="text-sm text-blue-500 hover:underline"
                                    >
                                        Xem chi tiết
                                    </Link> */}
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
