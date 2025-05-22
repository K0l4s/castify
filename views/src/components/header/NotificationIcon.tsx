import { useEffect, useState } from 'react';
import useStomp from '../../hooks/useStomp';
import Tooltip from '../UI/custom/Tooltip';
import { IoIosNotifications } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { NotificationService } from '../../services/NotificationService';
import { setTotalUnRead } from '../../redux/slice/notificationSlice';
import NotificationPopup from '../main/notification/NotificationPopup';
import { NotiModel } from '../../models/Notification';
const NotificationIcon = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const totalUnRead = useSelector((state: RootState) => state.Notification.totalUnRead);
    const [newMessage, setNewMessage] = useState<NotiModel>();
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
            setNewMessage(stomp);
            dispatch(setTotalUnRead(totalUnRead + 1));
        }
    }, [stomp]);

   
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
            {/* {isOpen && ( */}
                <NotificationPopup newMessage={newMessage} isOpen={isOpen} onClose={() => setIsOpen(false)}/>
            {/* )} */}
        </div>
    );
};

export default NotificationIcon;
