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
import useStomp from "../../../hooks/useStomp";

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
        // if(messages.length>6)
        //   window.scrollTo(0, document.body.scrollHeight);
      } catch (error) {
        console.error("❌ Failed to fetch messages:", error);
      }
    }
    fetch();
    console.log("🔄 Fetching messages...", pageNumber);
  }, [useParams().id]);
  const object = useStomp({
    subscribeUrl: `/topic/group/${id}`,
    trigger: [id, currentUser],
    flag:id?true:false
  });

  useEffect(() => {
    if (object) {
      const newMessage: Message = object;
      setMessages((prev) => [...prev, newMessage]);
      // scroll to the bottom
      window.scrollTo(0, document.body.scrollHeight);
    }
  }, [object]);

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
      window.scrollTo(0, document.body.scrollHeight + 50);
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
    }, 100);
  }, [pageNumber]);

  useEffect(() => {
    // infinite scroll
    const handleScroll = () => {
      console.log( document.documentElement.scrollTop);
      // const chatContainer = document.getElementById("chat-container");
      // console.log(chatContainer?.scrollHeight);

      if (
        document.documentElement.scrollTop > 5
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
        id="chat-container"
        className="flex flex-col gap-2 p-4 min-h-screen overflow-y-auto">
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
                src={msg.sender?.avatarUrl ? msg.sender.avatarUrl : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-uwAPsc9m6frK85uQog_CeCpOwlfgpsjZKA&s"}
                alt={msg.sender.fullname}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div
              className={`flex flex-col ${msg.sender.id === currentUser?.id ? "items-end" : ""
                }`}
            >
              <span className="font-semibold text-black dark:text-white">{msg.sender.fullname}</span>
              <span
                className={`p-2 max-w-5xl rounded-lg ${msg.sender.id === currentUser?.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700  text-black dark:text-white"
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
          <textarea
            id="message"
            // type="text"
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
