import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useEffect, useState } from "react";
import CreateConversationModal from "../../modals/msg/CreateConversationModal";
import { shortConversation } from "../../../models/Conversation";
import { conversationService } from "../../../services/ConversationService";
import { Link, useParams } from "react-router-dom";

const ConversationSidebar = () => {
    const isOpenSideBar = useSelector((state: RootState) => state.sidebar.isOpen);
    const [isOpenCreateNew, setIsOpenCreateNew] = useState<boolean>(false);
    const [conversations, setConversations] = useState<shortConversation[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const limit = 20;

    const conversation = useSelector((state: RootState) => state.message.newConversation);
    const { id } = useParams();
    
    const fetchData = async (pageNumber = 0) => {
        console.log("Fetching page:", pageNumber);
        try {
            setIsLoading(true);
            const response = await conversationService.getByUserId(pageNumber, limit);
            const data = response.data.data;
            // console.log("Total pages:", response.data.totalPages);
            console.log("Data length:", data);
            if (pageNumber >= response.data.totalPages - 1 || data.length < limit) {
                setHasMore(false);
            }

            setConversations((prev) => [...prev, ...data]);

        } catch (error) {
            console.error("Failed to fetch conversations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(page);
    }, [page]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop - clientHeight < 50 && hasMore && !isLoading) {
            console.log("Next Page:", page + 1);
            setPage(page + 1);
        }
    };

    useEffect(() => {
        if (conversation) {
            // setConversations((prevConversations) => {
            //     const isExist = prevConversations.some((c) => c.id === conversation.id);
            //     if (isExist) return [];
            //     return [conversation, ...prevConversations];
            // });
            setPage(0);
            setHasMore(true);
        }
    }, [conversation]);

    return (
        <div id="logo-sidebar" className={`h-screen ${isOpenSideBar ? 'w-56' : 'w-16'}`}>
            <div
                onScroll={handleScroll}
                className={`h-screen fixed ${isOpenSideBar ? 'w-56' : 'w-16'} 
                    bg-white border-gray-200 border-r 
                    dark:bg-gray-800 dark:border-gray-700 
                    text-black dark:text-white 
                    overflow-y-scroll`}
            >
                <div className="flex items-center gap-1 flex-col pb-10">
                    {/* create conversation button */}
                    <div
                        className="flex w-full items-center cursor-pointer gap-2 p-2 sticky bg-gray-200 dark:bg-gray-900 top-0 z-10"
                        onClick={() => setIsOpenCreateNew(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {isOpenSideBar && <h2 className="font-semibold">Create Conversation</h2>}
                    </div>

                    {/* conversation list */}
                    {conversations.map((conversation) => (
                        <Link
                            to={`/msg/${conversation.id}`}
                            key={conversation.id}
                            className={`flex w-full items-center gap-2 p-2 cursor-pointer duration-300 ease-in-out hover:bg-gray-200 hover:dark:bg-gray-900 ${conversation.id === id ? 'bg-gray-200 dark:bg-gray-900' : ''
                                }`}
                        >
                            <div className="relative">
                                <img
                                    src={
                                        conversation.imageUrl
                                            ? conversation.imageUrl
                                            : "https://png.pngtree.com/png-vector/20190725/ourmid/pngtree-group-avatar-icon-design-vector-png-image_1585671.jpg"
                                    }
                                    alt="avatar"
                                    className="w-10 h-full rounded-full object-cover object-center border-2 border-yellow-500"
                                />
                                {/* chấm đỏ nếu read = false */}
                                <div className="absolute top-1 right-1">
                                    {!conversation.lastMessage?.read && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                                    )}
                                </div>
                            </div>
                            <div>
                                {isOpenSideBar && (
                                    <div>
                                        <h2 className="font-semibold">{conversation.title}</h2>
                                        <p className={`text-gray-500 ${conversation.lastMessage?.read ? 'font-normal' : 'font-bold text-red-300'}`}>
                                            {conversation.lastMessage?.content || "Nhóm đã được tạo"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}

                    {/* loading indicator */}
                    {hasMore && isLoading && (
                        <div className="text-sm text-gray-400 py-2">Đang tải thêm...</div>
                    )}

                    {/* spacer để tránh item cuối bị lọt ra ngoài */}
                    <div className="h-16" />
                </div>
            </div>

            <CreateConversationModal
                isOpen={isOpenCreateNew}
                onClose={() => setIsOpenCreateNew(false)}
                conversations={conversations}
                setConversations={setConversations}
            />
        </div>
    );
};

export default ConversationSidebar;
