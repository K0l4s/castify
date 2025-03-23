import { useParams } from "react-router-dom";
import MainHeader from "../../../components/header/MainHeader"
import ConversationSidebar from "../../../components/main/conversation/ConversationSidebar"
import MainConversation from "../../../components/main/conversation/MainConversation"

const ConversationLayout = () => {
      const id = useParams().id;
    
    return (
        <div>
            <MainHeader />
            <div className="flex ">
                <ConversationSidebar />
                {id ? (<MainConversation />) : (
                    <div className="h-full w-full grid place-items-center">
                        <img className="" src="https://cdni.iconscout.com/illustration/premium/thumb/conversation-illustration-download-in-svg-png-gif-file-formats--like-logo-love-discussion-romantic-comment-social-media-reaction-communication-pack-network-illustrations-4705280.png?f=webp" alt="" />
                        <h1 className="text-3xl font-semibold text-gray-500 dark:text-gray-400">Please select a conversation</h1>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ConversationLayout