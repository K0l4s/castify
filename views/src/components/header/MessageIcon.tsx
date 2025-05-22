
import Tooltip from '../UI/custom/Tooltip'
import { BiMessageRoundedDots } from 'react-icons/bi'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '../../redux/store'
import { useEffect, useState } from 'react'
import { receiveMsg, resetNewConversation } from '../../redux/slice/messageSlice'
import useStomp from '../../hooks/useStomp'
import { shortConversation } from '../../models/Conversation'
import { conversationService } from '../../services/ConversationService'
const MessageIcon = () => {
  const navigate = useNavigate()
  // const conversation = useSelector((state: RootState) => state.message.conversation);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [isRead, setIsRead] = useState<boolean>(false);
  const dispatch = useDispatch();
  const data: shortConversation = useStomp(
    {
      subscribeUrl: `/user/${currentUser?.id}/queue/msg`,
      trigger: [currentUser],
    }
  )
  const isClick = useSelector((state:RootState)=> state.message.isClick)
  useEffect(() => {
    const fetchIsRead = async () => {
      try {
        const response = await conversationService.hasUnreadMsg();
        console.log("Hello " + response.data);
        setIsRead(!response.data)
        
      } catch (error) {
        console.error("Error fetching unread messages:", error);
      } 
    };
    fetchIsRead(); 
  }, [isClick]);
  
  useEffect(() => {
    if (data) {
      console.log(data)
      setIsRead(false);
      dispatch(receiveMsg(data));
    }
  }, [data])
  return (
    <>
      <Tooltip text="Messages">
        <button
          onClick={() => 
            {navigate('/msg')
              dispatch(resetNewConversation()); // gọi luôn ở đây
            }

          }
          className="p-2 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
          {!isRead && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"> </span>}
          <BiMessageRoundedDots className="w-5 h-5" />
        </button>
      </Tooltip>
    </>
  )
}

export default MessageIcon