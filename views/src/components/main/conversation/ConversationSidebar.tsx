import { useSelector } from "react-redux"
import { RootState } from "../../../redux/store";
import { useEffect, useState } from "react";
import CreateConversationModal from "../../modals/msg/CreateConversationModal";
import { shortConversation } from "../../../models/Conversation";
import { conversationService } from "../../../services/ConversationService";
import { Link } from "react-router-dom";
const ConversationSidebar = () => {
    const isOpenSideBar = useSelector((state: RootState) => state.sidebar.isOpen);
    const [isOpenCreateNew, setIsOpenCreateNew] = useState<boolean>(false);
    const [conversations, setConversations] = useState<shortConversation[]>([]);
    const conversation = useSelector((state: RootState) => state.message.newConversation);
    const fetchData = async () => {
        const response = await conversationService.getByUserId(0, 10);
        setConversations(response.data.data);
    }
    useEffect(() => {

        fetchData();
    }, [])
    // kiểm tra sự thay đổi của conversation 
    useEffect(() => {
        console.log(conversation);
        if (conversation) {
            setConversations((prevConversations) => {
                const updatedConversations = prevConversations.filter((c) => c.id !== conversation.id);
                return [conversation, ...updatedConversations] as shortConversation[];
            });
        }
    }, [conversation]);
    // const checkNotificationPermission = async () => {
    //     if (!('Notification' in window)) {
    //       console.log('Trình duyệt của bạn không hỗ trợ thông báo.');
    //       return;
    //     }
    
    //     if (Notification.permission === 'granted') {
    //       showNotification();
    //     } else if (Notification.permission !== 'denied') {
    //       const permission = await Notification.requestPermission();
    //       if (permission === 'granted') {
    //         showNotification();
    //       }
    //     }
    //   };
    
    //   // Hiển thị thông báo
    //   const showNotification = () => {
    //     new Notification('Bạn có tin nhắn mới', {
    //       body: 'Đây là một thông báo ví dụ!',
    //       icon: '/icon.png', // Đường dẫn đến icon (nếu có)

    //     });
    //   };
    
    return (
        <div id="logo-sidebar"
            className={`h-screen ${isOpenSideBar ? 'w-56' : 'w-16'}`}
        >
            <div className={`h-screen fixed ${isOpenSideBar ? 'w-56' : 'w-16'} bg-white border-gray-200 border-r dark:bg-gray-800 dark:border-gray-700 text-black dark:text-white overflow-y-none hover:overflow-y-auto hover:overflow-y-scroll custom-scrollbar`}>

                <div className=" flex items-center gap-3 flex-col">
                    {/* create conversation components*/}
                    <div className="flex w-full items-center cursor-pointer gap-2 p-2 sticky bg-gray-900 top-0" onClick={() => setIsOpenCreateNew(true)}>
                        {/* create icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {isOpenSideBar &&
                            (
                                <h2 className="font-semibold">Create Conversation</h2>)}

                    </div>
                    {conversations.map((conversation) => (
                        <Link to={"/msg/" + conversation.id} className="flex w-full items-center gap-2 p-2 cursor-pointer hover:bg-gray-900" key={conversation.id}>
                            <img
                                src={conversation.imageUrl ? conversation.imageUrl : "https://png.pngtree.com/png-vector/20190725/ourmid/pngtree-group-avatar-icon-design-vector-png-image_1585671.jpg"}
                                alt="avatar"
                                className="w-10 h-10 rounded-full object-cover object-center border-2 border-yellow-500"
                            />
                            <div>
                                {isOpenSideBar && <div>
                                    <h2 className="font-semibold">{conversation.title}</h2>
                                    <p className="text-gray-500">{conversation.lastMessage? conversation.lastMessage : "Nhóm đã được tạo"}</p>
                                </div>}
                            </div>
                        </Link>
                    ))}
                </div></div>
            <CreateConversationModal isOpen={isOpenCreateNew} onClose={() => setIsOpenCreateNew(false)} conversations={conversations} setConversations={setConversations} />
        </div>
    )
}

export default ConversationSidebar