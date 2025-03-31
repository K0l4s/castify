import { useEffect, useRef, useState } from 'react';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Cookies from 'js-cookie';
import { BaseApi } from '../utils/axiosInstance';
interface UseStompProps {
    subscribeUrl: string;
    trigger:any[];
    flag?:boolean;
    onDisconnect?: () => void;
    onConnect?: () => void;
    onStompError?: (frame: any) => void;
    onWebSocketError?: (error: any) => void;
    reconnectDelay?: number;
}
const useStomp = ({ subscribeUrl,trigger,flag=true,onConnect,onDisconnect,onStompError,onWebSocketError,reconnectDelay }: UseStompProps) => {
    // const [client, setClient] = useState<Client | null>(null);
    const stompClientRef = useRef<Client | null>(null);
    const [object, setObject] = useState<any>(null);
    useEffect(() => {
        // console.log("🔄 Khởi tạo WebSocket...");

        const socket = new SockJS(BaseApi + "/ws");
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: reconnectDelay? reconnectDelay : 5000,
            connectHeaders: {
                Authorization: `Bearer ${Cookies.get("token")}`,
                "ngrok-skip-browser-warning": "true"
            },
            onConnect: () => {
                // console.log("✅ WebSocket connected successfully");
                console.log("subscribe: "+subscribeUrl)
                // 📥 Nhận tin nhắn trong nhóm hiện tại
                if (flag) {
                    stompClient.subscribe(subscribeUrl, (message) => {
                        const newMessage: Message = JSON.parse(message.body);
                        setObject(newMessage);
                        // setMessages((prev) => [...prev, newMessage]);
                        // scroll to the bottom
                    });
                }
                onConnect && onConnect();
            },
            onDisconnect: () => {
                console.log("❎ WebSocket disconnected");
                onDisconnect && onDisconnect();
            },
            onStompError: (frame) => {
                console.error("🚨 Broker reported error: " + frame.headers["message"]);
                console.error("📄 Additional details: " + frame.body);
                onStompError && onStompError(frame);
            },
            onWebSocketError: (error) => {
                console.error("🔌 WebSocket error:", error);
                onWebSocketError && onWebSocketError(error);
            },
        });

        stompClient.activate();
        stompClientRef.current = stompClient;

        return () => {
            console.log("🔄 Cleaning up WebSocket...");
            stompClient.deactivate();
        };
    }, [...trigger]);

    return object;
};

export default useStomp;