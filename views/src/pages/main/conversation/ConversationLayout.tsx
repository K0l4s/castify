import MainHeader from "../../../components/header/MainHeader"
import ConversationSidebar from "../../../components/main/conversation/ConversationSidebar"
import MainConversation from "../../../components/main/conversation/MainConversation"

const ConversationLayout = () => {
    return (
        <div>
            <MainHeader />
            <div className="flex">
                <ConversationSidebar />
                <MainConversation />
            </div>
        </div>
    )
}

export default ConversationLayout