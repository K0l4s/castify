import { useSelector } from "react-redux"
import { RootState } from "../../../redux/store";
import { useState } from "react";
import CreateConversationModal from "../../modals/msg/CreateConversationModal";

const ConversationSidebar = () => {
    const isOpenSideBar = useSelector((state: RootState) => state.sidebar.isOpen);
    const [isOpenCreateNew,setIsOpenCreateNew] = useState<boolean>(false);

    return (
        <div id="logo-sidebar"
            className={`h-screen ${isOpenSideBar ? 'w-56' : 'w-14'}`}
        >
            <div className={`h-screen fixed ${isOpenSideBar ? 'w-56' : 'w-14'} bg-white border-gray-200 border-r dark:bg-gray-800 dark:border-gray-700 text-black dark:text-white `}>
                
                <div className="mt-4 flex items-center gap-3 flex-col">
                    {/* create conversation components*/}
                    <div className="flex w-full items-center gap-2 p-2" onClick={()=>setIsOpenCreateNew(true)}>
                        {/* create icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {isOpenSideBar &&
                            (
                                <h2 className="font-semibold">Create Conversation</h2>)}

                    </div>
                    <div className="flex w-full h-15 items-center gap-2 bg-purple-900/40 p-2">
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_gaxAkYYDw8UfNleSC2Viswv3xSmOa4bIAQ&s"
                            alt="avatar"
                            className="w-10 h-10 rounded-full object-cover object-center border-2 border-yellow-500"
                        />
                        {isOpenSideBar &&
                            (
                                <div>
                                    <h2 className="font-semibold">John Doe</h2>
                                    <p className="text-gray-500">Hello, how are you?</p>
                                </div>)}
                    </div>
                    {/* <div className="flex w-full items-center gap-2 p-2 rounded-lg">
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_gaxAkYYDw8UfNleSC2Viswv3xSmOa4bIAQ&s"
                            alt="avatar"
                            className="w-10 h-10 rounded-full object-cover object-center border-2 border-yellow-500"
                        />
                        <div>
                            <h2 className="font-semibold">John Doe</h2>
                            <p className="text-gray-500">Hello, how are you?</p>
                        </div>
                    </div> */}
                </div></div>
                <CreateConversationModal isOpen={isOpenCreateNew} onClose={()=>setIsOpenCreateNew(false)}/>
        </div>
    )
}

export default ConversationSidebar