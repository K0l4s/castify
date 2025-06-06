import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useEffect, useRef, useState } from "react";
import CreateConversationModal from "../../modals/msg/CreateConversationModal";
import { shortConversation } from "../../../models/Conversation";
import { conversationService } from "../../../services/ConversationService";
import { Link, useParams } from "react-router-dom";
import { resetNewConversation, setClick } from "../../../redux/slice/messageSlice";

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
            setConversations((prev) => {
                return [...prev, ...data]
            });

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
    const dispatch = useDispatch();
    const handledConversationId = useRef<string | null>(null);

    useEffect(() => {
        if (conversation && conversation.id !== handledConversationId.current) {
            handledConversationId.current = conversation.id;

            setConversations((prevConversations) => {
                const exists = prevConversations.some((c) => c.id === conversation.id);
                if (exists) return prevConversations;

                const newConversation = { ...conversation };
                if (id === conversation.id && conversation.lastMessage?.id) {
                    newConversation.lastMessage = {
                        ...conversation.lastMessage,
                        read: true,
                    };
                }

                return [newConversation, ...prevConversations];
            });

            dispatch(resetNewConversation());
        }
    }, [conversation]);


    const click = useSelector((state: RootState) => state.message.isClick);
    const handleClickConversation = (converId: string) => {
        setConversations((prevConversations) =>
            prevConversations.map((conversation) => {
                if (conversation.id === converId && conversation.lastMessage?.id) {
                    // Chỉ cập nhật khi lastMessage và id tồn tại
                    return {
                        ...conversation,
                        lastMessage: {
                            ...conversation.lastMessage,
                            id: conversation.lastMessage.id, // Đảm bảo không bị undefined
                            read: true,
                        },
                    };
                }
                return conversation;
            })
        );
        dispatch(setClick(!click))
    };
    return (
        <div
            id="logo-sidebar"
            className={`h-screen fixed top-13 left-0 transition-all duration-300 shadow-lg z-30 ${
            isOpenSideBar ? 'w-72' : 'w-20'
            } bg-gradient-to-b from-white via-gray-50 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}
        >
            <div
            onScroll={handleScroll}
            className={`h-full absolute top-0 left-0 transition-all duration-300 ${
            isOpenSideBar ? 'w-72' : 'w-20'
            } bg-transparent border-r border-gray-200 dark:border-gray-700 text-black dark:text-white overflow-y-auto`}
            >
            <div className="flex flex-col items-center gap-2 pb-10">
            {/* create conversation button */}
            <div
            className={`flex items-center cursor-pointer gap-3 p-3 sticky top-0 z-20 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
                isOpenSideBar ? 'w-64 bg-white/80 dark:bg-gray-900/80 justify-start' : 'w-16 bg-white dark:bg-gray-900 justify-center'
            }`}
            onClick={() => setIsOpenCreateNew(true)}
            >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            </div>
            {isOpenSideBar && (
                <h2 className="font-semibold text-lg text-gray-700 dark:text-gray-100 truncate">
                New Conversation
                </h2>
            )}
            </div>

            {/* conversation list */}
            <div className="w-full flex flex-col gap-1 mt-2">
            {conversations.map((conversation) => (
                <Link
                onClick={() => handleClickConversation(conversation.id)}
                to={`/msg/${conversation.id}`}
                key={conversation.id}
                className={`group flex items-center gap-3 px-3 py-2 rounded-lg mx-2 cursor-pointer transition-all duration-200 ${
                conversation.id === id
                ? 'bg-gradient-to-r from-yellow-100 to-pink-100 dark:from-gray-800 dark:to-gray-900 shadow'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                } ${isOpenSideBar ? '' : 'justify-center'}`}
                >
                <div className="relative flex-shrink-0 flex items-center justify-center">
                <img
                src={
                    conversation.imageUrl
                    ? conversation.imageUrl
                    : "https://png.pngtree.com/png-vector/20190725/ourmid/pngtree-group-avatar-icon-design-vector-png-image_1585671.jpg"
                }
                alt="avatar"
                className="w-12 h-12 object-cover rounded-full border-2 border-yellow-400 shadow-sm"
                />
                {/* chấm đỏ nếu read = false */}
                {!conversation.lastMessage?.read && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
                </div>
                {isOpenSideBar && (
                <div className="flex-1 min-w-0">
                <h2 className="font-semibold truncate text-gray-800 dark:text-gray-100">
                    {conversation.title}
                </h2>
                <p
                    className={`truncate text-sm ${
                    conversation.lastMessage?.read
                    ? 'text-gray-500 font-normal'
                    : 'font-semibold text-pink-500'
                    }`}
                >
                    {conversation.lastMessage?.content || "Nhóm đã được tạo"}
                </p>
                </div>
                )}
                </Link>
            ))}
            </div>

            {/* loading indicator */}
            {hasMore && isLoading && (
            <div className="flex items-center justify-center w-full py-4">
                <svg className="animate-spin h-5 w-5 text-yellow-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <span className="text-sm text-gray-400">Đang tải thêm...</span>
            </div>
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
