

import { useEffect, useRef } from 'react';
import { LanguageProvider } from './context/LanguageContext'
import { PodcastProvider } from './context/PodcastContext'
// import { ThemeProvider } from './context/ThemeContext'
import Router from './routers/Router'
import SockJS from 'sockjs-client';
import { BaseApi } from './utils/axiosInstance';
import { Client } from '@stomp/stompjs';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './redux/store';
import { receiveMsg } from './redux/slice/messageSlice';
function App() {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const stompClientRef = useRef<Client | null>(null);
  const dispatch = useDispatch();
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
        

        // 🔔 Nhận thông báo tin nhắn cá nhân
        stompClient.subscribe(
          `/user/${currentUser?.id}/queue/msg`,
          (message) => {
            const notification = JSON.parse(message.body);
            console.log("🔔 New message notification:", notification);
            dispatch(receiveMsg(notification));
            // checkNotificationPermission();
            // Kiểm tra xem người dùng có đang ở đúng group không
            // toast.info("Hello");
            
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
  }, [currentUser]);

  return (
    <>
      {/* <ThemeProvider> */}
      <LanguageProvider>
        <PodcastProvider>
          <Router />
        </PodcastProvider>
      </LanguageProvider>
      {/* </ThemeProvider> */}
    </>
  )
}

export default App;
