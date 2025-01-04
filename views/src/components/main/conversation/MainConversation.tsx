import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Message } from "../../../models/Conversation";
import { conversationService } from "../../../services/ConversationService";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Cookies from "js-cookie";
import { useToast } from "../../../context/ToastProvider";
import { BaseApi } from "../../../utils/axiosInstance";
import { formatDistanceToNow } from "date-fns";
import { TbSend } from "react-icons/tb";

const MainConversation = () => {
  const id = useParams().id;
  const [messages, setMessages] = useState<Message[]>([]);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const stompClientRef = useRef<Client | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [isFeching, setIsFeching] = useState(false);
  useEffect(() => {
    console.log(messages.length);
  }
  ), [messages];
  const pageSize = 7;
  const toast = useToast();
  const fetchMessages = async () => {
    if (!id) return;
    setIsFeching(true);
    try {
      const response = await conversationService.getMsgByConversationId(id, pageNumber - 1, pageSize);
      setTotalPage(response.data.totalPages);
      console.log(pageNumber)
      console.log(response.data);
      // đảo ngược mảng để hiển thị tin nhắn mới nhất ở cuối
      setMessages((prevMessages) => [...response.data.data.reverse(), ...prevMessages]);
      // setPageNumber((prev) => prev + 1);
    } catch (error) {
      console.error("❌ Failed to fetch messages:", error);
    } finally {
      setIsFeching(false);
    }
  };
  useEffect(() => {
    setMessages([]);
    setPageNumber(1);
    const fetch = async () => {
      if (!id) return;
      try {
        const response = await conversationService.getMsgByConversationId(id, 0, pageSize);
        setTotalPage(response.data.totalPages);
        setMessages(response.data.data.reverse());
        setPageNumber(2);
        // scroll to bottom
        window.scrollTo(0, document.body.scrollHeight);
      } catch (error) {
        console.error("❌ Failed to fetch messages:", error);
      }
    }
    fetch();
    console.log("🔄 Fetching messages...", pageNumber);
  }, [useParams().id]);

  // ⚡ Setup WebSocket connection
  useEffect(() => {
    console.log("🔄 Khởi tạo WebSocket...");

    const socket = new SockJS(BaseApi + "/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      connectHeaders: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      onConnect: () => {
        console.log("✅ WebSocket connected successfully");

        // 📥 Nhận tin nhắn trong nhóm hiện tại
        if (id) {
          stompClient.subscribe(`/topic/group/${id}`, (message) => {
            const newMessage: Message = JSON.parse(message.body);
            setMessages((prev) => [...prev, newMessage]);
          });
        }

        // 🔔 Nhận thông báo tin nhắn cá nhân
        stompClient.subscribe(
          `/user/${currentUser?.id}/queue/msg`,
          (message) => {
            const notification = JSON.parse(message.body);
            console.log("🔔 New message notification:", notification);

            // Kiểm tra xem người dùng có đang ở đúng group không
            if (notification.groupId === id) {
              setMessages((prev) => [...prev, notification.message]);

            } else {
              toast.info(
                `📩 Tin nhắn mới từ nhóm: ${notification.groupName}`
              );
            }
          }
        );
      },
      onDisconnect: () => {
        console.log("❎ WebSocket disconnected");
      },
      onStompError: (frame) => {
        console.error("🚨 Broker reported error: " + frame.headers["message"]);
        console.error("📄 Additional details: " + frame.body);
      },
      onWebSocketError: (error) => {
        console.error("🔌 WebSocket error:", error);
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      console.log("🔄 Cleaning up WebSocket...");
      stompClient.deactivate();
    };
  }, [id, currentUser]);

  // 📩 Send Message
  const sendMessage = async () => {
    const inputElement = document.getElementById("message") as HTMLInputElement;
    const message = inputElement.value.trim();

    if (!message || !id) return;

    try {
      await conversationService.sendMessage(message, id);
      // const newMessage: Message = response.data;
      // setMessages((prev) => [...prev, newMessage]);
      inputElement.value = "";
    } catch (error) {
      console.error("❌ Failed to send message:", error);
    }
  };
  useEffect(() => {
    // timeout
    setTimeout(() => {
      if (pageNumber > 1 && pageNumber <= totalPage) {
        fetchMessages();
        // scroll xuống dưới cùng
        window.scrollTo(0, 500);
      }
    }, 500);
  }, [pageNumber]);

  useEffect(() => {
    // infinite scroll
    const handleScroll = () => {
      // console.log(window.innerHeight + document.documentElement.scrollTop);
      // console.log(document.documentElement.offsetHeight);

        if (
          window.innerHeight + document.documentElement.scrollTop !== 712
        )
          return;
        if (pageNumber > totalPage) return;
        if (isFeching) return;

        setPageNumber((prev) => prev + 1);
        console.log("🔄 Fetching messages...", pageNumber);
     
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full min-h-full bg-gray-100 dark:bg-gray-800 relative">
      <div

        className="flex flex-col gap-2 p-4 min-h-screen overflow-y-auto">
        {/* load more */}
        {/* {pageNumber <= totalPage && (
          <button

            className="p-2 bg-blue-500 text-white rounded-lg "
            onClick={fetchMessages}
          >
            Load more
          </button>
        )} */}
        {/* nếu fetching thì hiển thị loading */}
        {isFeching && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.sender.id === currentUser?.id ? "justify-end" : ""
              }`}
          >
            {msg.sender.id !== currentUser?.id && (
              <img
                src={msg.sender.avatarUrl}
                alt={msg.sender.fullname}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div
              className={`flex flex-col ${msg.sender.id === currentUser?.id ? "items-end" : ""
                }`}
            >
              <span className="font-semibold">{msg.sender.fullname}</span>
              <span
                className={`p-2 rounded-lg ${msg.sender.id === currentUser?.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
                  }`}
              >
                {msg.content}
                {/*  */}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 shadow-md">
        <div className="flex items-center gap-2">
          <input
            id="message"
            type="text"
            placeholder="Type your message here..."
            className="flex-1 p-3 rounded-lg border text-black dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            className="p-3 bg-blue-500 rounded-lg bg-transparent absolute right-5 text-blue-500"
            onClick={sendMessage}
          >
            <TbSend size={24} />
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default MainConversation;
