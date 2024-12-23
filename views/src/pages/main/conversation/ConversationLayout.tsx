import MainHeader from "../../../components/header/MainHeader"
import ConversationSidebar from "../../../components/main/conversation/ConversationSidebar"
import MainConversation from "../../../components/main/conversation/MainConversation"

const ConversationLayout = () => {
    return (
        <div>
            <MainHeader/>
            <ConversationSidebar />
            <MainConversation />
        </div>
    )
}

export default ConversationLayout