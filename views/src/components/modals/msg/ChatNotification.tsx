import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { Link } from 'react-router-dom';

const ChatNotification = () => {
    const newConversation = useSelector((state: RootState) => state.message.newConversation);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (newConversation) {
            setVisible(true);

            // Tự động ẩn sau 5 giây
            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000);

            return () => clearTimeout(timer); // Dọn dẹp timeout khi component unmount hoặc newConversation thay đổi
        }
    }, [newConversation]);

    if (!visible) return null; // Không hiển thị nếu `visible` là false

    return (
        <Link to={'/msg/'+newConversation?.id} className="p-6 max-w-lg mx-auto bg-white/95 dark:bg-black/95 text-black dark:text-white rounded-xl shadow-md flex items-center space-x-4 fixed left-4 bottom-4 z-50">
            <div className="shrink-0">
                <img
                    className="h-12 w-12"
                    src={newConversation?.imageUrl || "https://cdn-icons-png.flaticon.com/512/5356/5356190.png"}
                    alt="chat-notification"
                />
            </div>
            <div>
                <div className="text-xl font-medium">{newConversation?.title}</div>
                <p className="text-slate-500 dark:text-slate-200">{newConversation?.lastMessage?.content}</p>
            </div>
        </Link>
    );
};

export default ChatNotification;
