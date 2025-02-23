
import Tooltip from '../UI/custom/Tooltip'
import { BiMessageRoundedDots } from 'react-icons/bi'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '../../redux/store'
import { useEffect } from 'react'
import { receiveMsg } from '../../redux/slice/messageSlice'
import useStomp from '../../hooks/useStomp'
import { shortConversation } from '../../models/Conversation'
const MessageIcon = () => {
  const navigate = useNavigate()
  const conversation = useSelector((state: RootState) => state.message.conversation);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const data: shortConversation = useStomp(
    {
      subscribeUrl: `/user/${currentUser?.id}/queue/msg`,
      trigger: [currentUser],
    }
  )
  useEffect(() => {
    if (data) {
      console.log(data)
      dispatch(receiveMsg(data));
    }
  }, [data])
  // useEffect(() => {
  //   console.log("🔄 Khởi tạo WebSocket...");

  //   const socket = new SockJS(BaseApi + "/ws");
  //   const stompClient = new Client({
  //     webSocketFactory: () => socket,
  //     reconnectDelay: 5000,
  //     connectHeaders: {
  //       Authorization: `Bearer ${Cookies.get("token")}`,
  //     },
  //     onConnect: () => {
  //       console.log("✅ WebSocket connected successfully");

  //       // 📥 Nhận tin nhắn trong nhóm hiện tại


  //       // 🔔 Nhận thông báo tin nhắn cá nhân
  //       stompClient.subscribe(
  //         `/user/${currentUser?.id}/queue/msg`,
  //         (message) => {
  //           const notification = JSON.parse(message.body);
  //           console.log("🔔 New message notification:", notification);
  //           dispatch(receiveMsg(notification));
  //           // checkNotificationPermission();
  //           // Kiểm tra xem người dùng có đang ở đúng group không
  //           // toast.info("Hello");

  //         }
  //       );
  //     },
  //     onDisconnect: () => {
  //       console.log("❎ WebSocket disconnected");
  //     },
  //     onStompError: (frame) => {
  //       console.error("🚨 Broker reported error: " + frame.headers["message"]);
  //       console.error("📄 Additional details: " + frame.body);
  //     },
  //     onWebSocketError: (error) => {
  //       console.error("🔌 WebSocket error:", error);
  //     },
  //   });

  //   stompClient.activate();
  //   stompClientRef.current = stompClient;

  //   return () => {
  //     console.log("🔄 Cleaning up WebSocket...");
  //     stompClient.deactivate();
  //   };
  // }, [currentUser]);
  return (
    <>
      <Tooltip text="Messages">
        <button
          onClick={() => navigate('/msg')}
          className="p-2 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
          {conversation.length > 0 && <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">{conversation.length}</span>}
          <BiMessageRoundedDots className="w-5 h-5" />
        </button>
      </Tooltip>
    </>
  )
}

export default MessageIcon