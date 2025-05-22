import { useEffect, useRef, useState } from 'react'
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { NotiModel } from '../../../models/Notification';
import { NotificationService } from '../../../services/NotificationService';
import Tooltip from '../../UI/custom/Tooltip';
import { IoMdDoneAll } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { setTotalUnRead } from '../../../redux/slice/notificationSlice';
import { useClickOutside } from '../../../hooks/useClickOutside';

interface Props {
    newMessage?: NotiModel;
    isOpen: boolean;
    onClose: () => void;
}

const NotificationPopup = (props: Props) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [notifications, setNotifications] = useState<NotiModel[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const totalUnRead = useSelector((state: RootState) => state.Notification.totalUnRead);

    useClickOutside(popupRef, () => {
        if (props.isOpen) {
            props.onClose();
        }
    });

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

    const fetchNotifications = async (currentPage: number) => {
        setLoading(true);
        try {
            const res = await NotificationService.getAllNotification(currentPage, 5);
            const newNotis = res.data.data;

            setNotifications(prev => [...prev, ...newNotis]);
            setHasMore(newNotis.length === 5); // Nếu ít hơn 5 cái thì không còn nữa
        } catch (error) {
            console.error('Lỗi tải thông báo:', error);
        }
        setLoading(false);
    };

    // Khi mở popup: reset lại danh sách và load lại từ đầu
    useEffect(() => {
        if (props.isOpen) {
            setNotifications([]);
            setPage(0);
            setHasMore(true);
            fetchNotifications(0);
        }
    }, [props.isOpen]);

    // Load thêm khi scroll xuống
    useEffect(() => {
        if (page !== 0) {
            fetchNotifications(page);
        }
    }, [page]);

    // Thêm thông báo mới (nếu chưa có trong danh sách)
    useEffect(() => {
        if (props.newMessage) {
            setNotifications(prev => {
                const exists = prev.some(n => n.id === props.newMessage!.id);
                if (exists) return prev;
                return [props.newMessage!, ...prev];
            });
        }
    }, [props.newMessage]);

    const handleScroll = () => {
        const container = containerRef.current;
        if (!container || loading || !hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        if (scrollHeight - scrollTop - clientHeight < 50) {
            setPage(prev => prev + 1);
        }
    };

    const readNoti = async (id: string) => {
        await NotificationService.readNoti(id);
        dispatch(setTotalUnRead(totalUnRead - 1));
    };

    const readAllNoti = async () => {
        await NotificationService.readAllNoti();
        dispatch(setTotalUnRead(0));
        setNotifications(prev => prev.map(noti => ({ ...noti, read: true })));
    };

    if (!props.isOpen) return null;

    return (
        <div ref={popupRef} className="absolute top-5 right-0 mt-2 w-96 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-10">
            <div className="p-4 max-h-96 overflow-y-auto" onScroll={handleScroll} ref={containerRef}>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 absolute top-0 p-2 right-3 left-0 flex justify-between px-12 pt-5 text-center rounded-lg bg-white dark:bg-gray-800 z-10">
                    <p>Thông báo</p>
                    <div className='flex gap-2'>
                        <Tooltip text="Đánh dấu đã đọc tất cả">
                            <IoMdDoneAll className="w-5 h-5 cursor-pointer" onClick={readAllNoti} />
                        </Tooltip>
                        <Tooltip text="Thêm">
                            <HiOutlineDotsHorizontal className="w-5 h-5 cursor-pointer" />
                        </Tooltip>
                    </div>
                </h3>

                <ul className="mt-12 space-y-2 mt-12 overflow-auto">
                    {notifications.map((noti) => (
                        <li
                            key={noti.id}
                            onClick={() => {
                                readNoti(noti.id);
                                noti.read = true;
                                navigate(noti.targetUrl);
                            }}
                            className={`p-3 w-full rounded-lg hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-700 flex items-center justify-between ${!noti.read ? 'bg-gray-200/10' : ''}`}
                        >
                            <div>
                                <p className="flex gap-1 text-sm font-medium text-gray-800 dark:text-gray-100 items-center">
                                    {noti.title}
                                    {!noti.read && (
                                        <span className='bg-red-500 p-1 rounded-lg text-[10px] text-white'>
                                            NEW
                                        </span>
                                    )}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{noti.content}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {formatTimeCalculation(noti.createdAt)}
                                </p>
                            </div>
                            <button
                                onClick={(e) => e.stopPropagation()}
                                className="relative p-2 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <HiOutlineDotsHorizontal className="w-5 h-5" />
                            </button>
                        </li>
                    ))}
                    {loading && (
                        <li className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                            Đang tải thêm...
                        </li>
                    )}
                    {!hasMore && notifications.length > 0 && (
                        <li className="text-center text-xs text-gray-400 py-2">
                            Không còn thông báo nào
                        </li>
                    )}
                    {!loading && notifications.length === 0 && (
                        <li className="text-center text-sm text-gray-400 py-2">
                            Không có thông báo nào
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default NotificationPopup;
