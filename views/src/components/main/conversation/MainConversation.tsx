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

const MainConversation = () => {
  const { id: groupId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const stompClientRef = useRef<Client | null>(null);
  const toast = useToast();

  // 🛠️ Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!groupId) return;
      try {
        const response = await conversationService.getMsgByConversationId(groupId, 0, 10);
        setMessages(response.data.data);
      } catch (error) {
        console.error("❌ Failed to fetch messages:", error);
      }
    };

    fetchMessages();
  }, [groupId]);

  // ⚡ Setup WebSocket connection
  useEffect(() => {
    console.log("🔄 Khởi tạo WebSocket...");

    const socket = new SockJS("http://localhost:8081/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      connectHeaders: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      onConnect: () => {
        console.log("✅ WebSocket connected successfully");

        // 📥 Nhận tin nhắn trong nhóm hiện tại
        if (groupId) {
          stompClient.subscribe(`/topic/group/${groupId}`, (message) => {
            const newMessage: Message = JSON.parse(message.body);
            setMessages((prev) => [...prev, newMessage]);
          });
        }

        // 🔔 Nhận thông báo tin nhắn cá nhân
        stompClient.subscribe(
          `/user/${currentUser?.id}/queue/message-notification`,
          (message) => {
            const notification = JSON.parse(message.body);
            console.log("🔔 New message notification:", notification);

            // Kiểm tra xem người dùng có đang ở đúng group không
            if (notification.groupId === groupId) {
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
  }, [groupId, currentUser]);

  // 📩 Send Message
  const sendMessage = async () => {
    const inputElement = document.getElementById("message") as HTMLInputElement;
    const message = inputElement.value.trim();

    if (!message || !groupId) return;

    try {
      const response = await conversationService.sendMessage(message, groupId);
      const newMessage: Message = response.data;
      setMessages((prev) => [...prev, newMessage]);
      inputElement.value = "";
    } catch (error) {
      console.error("❌ Failed to send message:", error);
    }
  };

  return (
    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 relative">
      {/* Messages */}
      <div className="flex flex-col gap-2 p-4 h-screen overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${
              msg.sender.id === currentUser?.id ? "justify-end" : ""
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
              className={`flex flex-col ${
                msg.sender.id === currentUser?.id ? "items-end" : ""
              }`}
            >
              <span className="font-semibold">{msg.sender.fullname}</span>
              <span
                className={`p-2 rounded-lg ${
                  msg.sender.id === currentUser?.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                {msg.content}
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
            className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            className="p-3 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainConversation;
