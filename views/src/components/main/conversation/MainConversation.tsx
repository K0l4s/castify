import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Message } from "../../../models/Conversation";
import { conversationService } from "../../../services/ConversationService";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { TbSend } from "react-icons/tb";
import useStomp from "../../../hooks/useStomp";
import MessageItem from "./MessageItem";
import { VscLoading } from "react-icons/vsc";

const MainConversation = () => {
  const id = useParams().id;
  const [messages, setMessages] = useState<Message[]>([]);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [isFeching, setIsFeching] = useState(false);
  useEffect(() => {
    console.log(messages.length);
  }, [messages]);
  const pageSize = 7;
  const fetchMessages = async () => {
    if (!id) return;
    setIsFeching(true);
    try {
      const response = await conversationService.getMsgByConversationId(id, pageNumber - 1, pageSize);
      setTotalPage(response.data.totalPages);
      console.log(pageNumber)
      console.log(response.data);
      // đảo ngược mảng để hiển thị tin nhắn mới nhất ở cuối
      setMessages((prevMessages) => [...prevMessages, ...response.data.data]);
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
        setMessages(response.data.data);
        setPageNumber(2);
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
    flag: id ? true : false
  });

  useEffect(() => {
    if (object) {
      const newMessage: Message = object;
      setMessages((prev) => [newMessage, ...prev]);
      // scroll to the bottom
      window.scrollTo(0, document.body.scrollHeight);
    }
  }, [object]);

  // 📩 Send Message
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const sendMessage = async () => {
    const inputElement = document.getElementById("message") as HTMLInputElement;
    const message = inputElement.value.trim();

    if (!message || !id) return;

    try {
      await conversationService.sendMessage(message, id);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
      <div className="flex items-center justify-between w-full px-4 py-2 bg-white border-b dark:bg-gray-900 dark:border-gray-700 sticky top-[65px] z-10">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Hội này hài!</h1>
        <div className="flex items-center gap-2">

        </div>
      </div>
      <div
        id="chat-container"
        className="flex flex-col gap-2 p-4 min-h-screen overflow-y-auto">
        {messages.slice().reverse().map((msg) => (
          <MessageItem
            key={msg.id}
            msg={msg}
            currentUser={currentUser}
          />
        ))}
        {messages.length < 1 &&
          <div className="flex flex-col items-center justify-center h-full absolute top-0 left-0 right-0 bottom-0">
            <img
              src="https://cdn.pixabay.com/animation/2023/06/13/15/13/15-13-25-972_512.gif"
              alt=""
              className="w-32 h-32 rounded-full mb-4 animate-bounce"
            />
            <h1 className="text-xl font-semibold text-gray-500 dark:text-gray-400 p-10 text-center">Ở đây hơi trống trải, hãy thử gửi tin nhắn đầu tiên xem nào!</h1>
          </div>
        }
      </div>
      {/* isFetching */}
      {isFeching && pageNumber > 1 && pageNumber <= totalPage &&
        <div className="flex justify-center flex-col items-center fixed z-10 top-20 left-0 right-0">
          <VscLoading className="animate-spin" color="gray" />
          <p className="text-gray-500">Đang tải thêm...</p>
        </div>
      }

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
