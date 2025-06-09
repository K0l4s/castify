import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import MainHeader from "../../../components/header/MainHeader";
import ConversationSidebar from "../../../components/main/conversation/ConversationSidebar";
import MainConversation from "../../../components/main/conversation/MainConversation";
import { RootState } from "../../../redux/store";

const ConversationLayout = () => {
    const { id } = useParams();
    const isOpenSideBar = useSelector((state: RootState) => state.sidebar.isOpen);

    return (
        <div>
            <MainHeader />

            <div className="flex">
                <ConversationSidebar />


                {/* Main Content */}
                <div className={`${isOpenSideBar ? 'w-72' : 'w-20'} transition-all duration-300`}>
                    <ConversationSidebar />
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {id ? (
                        <MainConversation />
                    ) : (
                        <div className="min-h-screen h-full w-full ">
                            <div className="grid place-items-center m-auto">
                                <img
                                    src="https://media.tenor.com/1r_7_6EtapgAAAAj/rolling-roll.gif"
                                    alt="Please select a conversation"
                                />
                                <h1 className="text-3xl font-semibold text-gray-500 dark:text-gray-400">
                                    Please select a conversation
                                </h1>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConversationLayout;