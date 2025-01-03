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
    const fetchData = async () => {
        const response = await conversationService.getByUserId(0, 10);
        setConversations(response.data.data);
    }
    useEffect(() => {

        fetchData();
    }, [])
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
                                src={conversation.imageUrl ? conversation.imageUrl : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_gaxAkYYDw8UfNleSC2Viswv3xSmOa4bIAQ&s"}
                                alt="avatar"
                                className="w-10 h-10 rounded-full object-cover object-center border-2 border-yellow-500"
                            />
                            <div>
                                {isOpenSideBar && <div>
                                    <h2 className="font-semibold">{conversation.title}</h2>
                                    <p className="text-gray-500">{conversation.memberSize} members</p>
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