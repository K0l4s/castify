import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ConversationDetail, FullMemberInfor, Message } from "../../../models/Conversation";
import { conversationService } from "../../../services/ConversationService";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { TbSend } from "react-icons/tb";
import useStomp from "../../../hooks/useStomp";
import MessageItem from "./MessageItem";
import { VscLoading } from "react-icons/vsc";
import { BsInfoCircle } from "react-icons/bs";
import { shortUser } from "../../../models/User";
import { setClick } from "../../../redux/slice/messageSlice";
import ChatSettingSidebar from "./ChatSettingSidebar";

const MainConversation = () => {
  const id = useParams().id;
  const [messages, setMessages] = useState<Message[]>([]);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [isFeching, setIsFeching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [chatDetail, setChatDetail] = useState<ConversationDetail>(
    {
      id: "",
      title: "",
      imageUrl: "",
      memberSize: 0,
      memberList: [],
      createdAt: "",
      active: false,
    }
  );
  const [members, setMembers] = useState<FullMemberInfor[]>([]);
  useEffect(() => {
    const fetchMembers = async () => {
      if (!id) return;
      try {
        const response = await conversationService.getMembers(id);
        setMembers(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch members:", error);
      }
    };
    fetchMembers();
  }
    , [id]);
  const dispatch = useDispatch();
  const click = useSelector((state: RootState) => state.message.isClick);

  useEffect(() => {
    dispatch(setClick(!click))
    const fetchChatDetail = async () => {
      if (!id) return;
      try {
        const response = await conversationService.getDetailChat(id);
        setChatDetail(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch chat detail:", error);
      }
      {
        conversationService.readMsg(id);
      }
    };
    fetchChatDetail();
  }
    , [id]);
  useEffect(() => {
    console.log(messages.length);
  }, [messages]);
  const pageSize = 15;
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
      if (pageNumber < 2) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }

      // }

      // setPageNumber((prev) => prev + 1);
    } catch (error) {
      console.error("❌ Failed to fetch messages:", error);
    } finally {
      setIsFeching(false);
      // bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
      // if (id)
      console.log("Id" + id)
      conversationService.readMsg(id?.toString() || "")
      window.scrollTo(0, document.body.scrollHeight);
    }
  }, [object]);
  const readObject = useStomp({
    subscribeUrl: `/topic/read/${id}`,
    trigger: [id, currentUser],
    flag: id ? true : false
  });
  useEffect(() => {
    if (readObject) {
      console.log("Read object")
      console.log(readObject)
      const newMessage: shortUser = readObject;
      console.log("New")
      console.log(newMessage)
      dispatch(setClick(!click))
      console.log(newMessage)
      console.log(members)
      setMembers((prevMembers) =>
        prevMembers.map((member) => {
          if (member.members.id === newMessage.id && messages.length > 0) {
            console.log("Hio")
            return {
              ...member,
              lastReadMessage: {
                // ...member.lastReadMessage,
                lastMessageId: messages[0].id,
                lastReadTime: new Date().toString()
              },
            };
          }
          return member;
        })
      );
      console.log(members)
      window.scrollTo(0, document.body.scrollHeight);
    }
  }
    , [readObject]);
  // 📩 Send Message
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const sendMessage = async () => {
    const inputElement = document.getElementById("message") as HTMLInputElement;
    const message = inputElement.value.trim();

    if (!message || !id) return;

    setIsSending(true); // Bắt đầu loading
    try {
      await conversationService.sendMessage(message, id);

      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      // setMessages((prev) => [...prev, newMessage]);
      inputElement.value = "";
      window.scrollTo(0, document.body.scrollHeight + 50);
    } catch (error) {
      console.error("❌ Failed to send message:", error);
    } finally {
      setIsSending(false); // Kết thúc loading
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
    <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-900 relative flex">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between w-full px-6 py-3 bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-[65px] z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <img
              src={chatDetail.imageUrl || "https://img.freepik.com/free-photo/people-office-work-day_23-2150690162.jpg"}
              alt=""
              className="w-11 h-11 rounded-full object-cover hover:scale-105 transition-transform duration-300 shadow-sm"
            />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{chatDetail.title}</h1>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <BsInfoCircle size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Chat Messages */}
        <div
          id="chat-container"
          className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto"
        >
          {messages.slice().reverse().map((msg) => (
            <MessageItem
              key={msg.id}
              msg={msg}
              members={members}
              currentUser={currentUser}
            />
          ))}

          {/* Empty State */}
          {messages.length < 1 && (
            <div className="flex flex-col items-center justify-center absolute inset-0">
              <img
                src="https://media.tenor.com/1r_7_6EtapgAAAAj/rolling-roll.gif"
                alt=""
                className="w-32 h-32 rounded-full mb-6 animate-bounce"
              />
              <h1 className="text-xl font-medium text-gray-500 dark:text-gray-400 px-10 text-center">
                Ở đây hơi trống trải, hãy thử gửi tin nhắn đầu tiên xem nào!
              </h1>
            </div>
          )}
        </div>

        {/* Loading More */}
        {isFeching && pageNumber > 1 && pageNumber <= totalPage && (
          <div className="flex justify-center items-center fixed top-24 left-0 right-0 z-10">
            <VscLoading className="animate-spin text-gray-500" size={24} />
            <p className="text-gray-500 ml-2">Đang tải thêm...</p>
          </div>
        )}

        {/* Input */}
        <div className="sticky bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 shadow-md z-10">
          <div className="flex items-center gap-3">
            <textarea
              id="message"
              placeholder="Nhập tin nhắn..."
              className="flex-1 p-3 rounded-lg border text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
              rows={1}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              disabled={isSending}
            />
            <button
              className={`p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center justify-center ${isSending ? "opacity-60 cursor-not-allowed" : ""}`}
              onClick={sendMessage}
              disabled={isSending}
            >
              {isSending ? <VscLoading className="animate-spin" size={20} /> : <TbSend size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <ChatSettingSidebar
        isShow={showInfo}
        chatDetail={chatDetail}
        memberList={members}
        setChatDetail={setChatDetail}
        setMemberList={setMembers}
      />
    </div>

  );
};

export default MainConversation;
