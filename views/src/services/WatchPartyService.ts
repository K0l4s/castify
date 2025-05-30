import { BaseApi } from "../utils/axiosInstance";
import { axiosInstanceAuth } from "../utils/axiosInstance";
import { ChatMessage, ChatMessageRequest, CreateRoomRequest, PlaybackSyncEvent, SyncEventType, WatchPartyRoom } from "../models/WatchPartyModel";
import { Client, Frame, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Cookie from "js-cookie";

export default class WatchPartyService {
  private static stompClient: Client | null = null;
  private static chatSubscription: any = null;
  private static syncSubscription: any = null;
  private static roomUpdateSubscription: any = null;
  private static roomId: string | null = null;
  private static chatMessageListeners: ((message: ChatMessage) => void)[] = [];
  private static syncEventListeners: ((event: PlaybackSyncEvent) => void)[] = [];
  private static roomUpdateListeners: ((room: WatchPartyRoom) => void)[] = [];
  private static connectionStatusListeners: ((connected: boolean) => void)[] = [];
  private static isConnecting: boolean = false;
  private static reconnectTimer: any = null;
  private static hostSyncRequestListeners: ((event: any) => void)[] = [];
  
  static async createRoom(request: CreateRoomRequest): Promise<WatchPartyRoom> {
    try {
      const response = await axiosInstanceAuth.post(`/api/v1/watch-party/create`, request);
      return response.data;
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  }

  static async joinRoom(roomCode: string): Promise<WatchPartyRoom> {
    try {
      const response = await axiosInstanceAuth.post(`/api/v1/watch-party/join/${roomCode}`, {});
      return response.data;
    } catch (error) {
      console.error("Error joining room:", error);
      throw error;
    }
  }

  static async leaveRoom(roomId: string): Promise<void> {
    try {
      await axiosInstanceAuth.post(`/api/v1/watch-party/leave/${roomId}`, {});
    } catch (error) {
      console.error("Error leaving room:", error);
      throw error;
    }
  }

  static async getRoomDetails(roomId: string): Promise<WatchPartyRoom> {
    try {
      const response = await axiosInstanceAuth.get(`/api/v1/watch-party/${roomId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting room details:", error);
      throw error;
    }
  }

  static async getPublicRooms(page: number = 0, size: number = 10): Promise<WatchPartyRoom[]> {
    try {
      const response = await axiosInstanceAuth.get(`/api/v1/watch-party/public?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error("Error getting public rooms:", error);
      throw error;
    }
  }

  static connect(roomId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Clear any existing reconnect timer
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      // If already connecting, return
      if (this.isConnecting) {
        console.log("Already connecting to WebSocket, waiting...");
        reject(new Error("Already connecting"));
        return;
      }
      
      // If already connected to the same room, resolve immediately
      if (this.stompClient?.connected && this.roomId === roomId) {
        console.log("Already connected to room:", roomId);
        resolve(true);
        return;
      }
      
      // Disconnect any existing connection first
      if (this.stompClient?.connected) {
        console.log("Disconnecting from existing connection before connecting to new room");
        this.disconnect();
      }
      
      this.isConnecting = true;
      this.roomId = roomId;
      console.log(`Connecting to room: ${roomId}`);
      
      // Get the token ONCE and use it consistently
      const token = Cookie.get("token");
      // console.log("Using token for connection:", token ? "Present" : "Missing");

      // Create a new SockJS connection
      const socket = new SockJS(`${BaseApi}/ws`);
      
      // Create STOMP client over SockJS
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true"
        },
        // debug: (str) => {
        //   console.log('STOMP Debug:', str);
        // },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
      });

      // On connection
      this.stompClient.onConnect = (frame: Frame) => {
        console.log('Connected to WebSocket:', frame);
        this.isConnecting = false;
        
        const subscribeHeaders = {
          Authorization: `Bearer ${token}`
        };

        // Subscribe to chat messages
        this.chatSubscription = this.stompClient?.subscribe(
          `/topic/room/${roomId}/chat`, 
          (message: Message) => this.handleChatMessage(message),
          subscribeHeaders
        );
        
        // Subscribe to playback sync events
        this.syncSubscription = this.stompClient?.subscribe(
          `/topic/room/${roomId}/sync`, 
          (message: Message) => this.handleSyncEvent(message),
          subscribeHeaders
        );
        
        // Subscribe to room updates
        this.roomUpdateSubscription = this.stompClient?.subscribe(
          `/topic/room/${roomId}/update`, 
          (message: Message) => this.handleRoomUpdate(message),
          subscribeHeaders
        );
        
        // Notify all listeners that we're connected
        this.connectionStatusListeners.forEach(listener => listener(true));
        
        // Request current room state
        this.requestRoomSync(roomId);
        
        resolve(true);
      };

      // On error
      this.stompClient.onStompError = (frame: Frame) => {
        console.error('STOMP error:', frame.headers['message']);
        this.isConnecting = false;
        this.connectionStatusListeners.forEach(listener => listener(false));
        this.scheduleReconnect(roomId);
        reject(new Error(frame.headers['message']));
      };

      this.stompClient.onWebSocketError = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.connectionStatusListeners.forEach(listener => listener(false));
        this.scheduleReconnect(roomId);
        reject(error);
      };

      // Start the connection
      this.stompClient.activate();
    });
  }

  private static scheduleReconnect(roomId: string): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    this.reconnectTimer = setTimeout(() => {
      console.log("Attempting to reconnect to WebSocket...");
      this.connect(roomId).catch(err => {
        console.error("Reconnection failed:", err);
      });
    }, 5000);
  }

  static disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.stompClient) {
      // Unsubscribe from topics
      if (this.chatSubscription) {
        try {
          this.chatSubscription.unsubscribe();
        } catch (e) {
          console.warn("Error unsubscribing from chat:", e);
        }
        this.chatSubscription = null;
      }
      
      if (this.syncSubscription) {
        try {
          this.syncSubscription.unsubscribe();
        } catch (e) {
          console.warn("Error unsubscribing from sync:", e);
        }
        this.syncSubscription = null;
      }
      
      if (this.roomUpdateSubscription) {
        try {
          this.roomUpdateSubscription.unsubscribe();
        } catch (e) {
          console.warn("Error unsubscribing from room updates:", e);
        }
        this.roomUpdateSubscription = null;
      }
      
      // Disconnect the client
      if (this.stompClient.connected) {
        try {
          this.stompClient.deactivate();
        } catch (e) {
          console.warn("Error deactivating STOMP client:", e);
        }
      }
      
      this.stompClient = null;
      this.roomId = null;
      this.isConnecting = false;
      
      // Notify listeners
      this.connectionStatusListeners.forEach(listener => listener(false));
    }
  }

  static requestRoomSync(roomId: string): void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('Cannot request room sync, not connected');
      return;
    }

    this.stompClient.publish({
      destination: `/app/room/${roomId}/sync-request`,
      body: JSON.stringify({}),
      headers: {
      'Authorization': `Bearer ${Cookie.get("token")}`
    }
    });
  }

  static sendChatMessage(roomId: string, message: string): void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('Cannot send message, not connected');
      return;
    }

    const chatRequest: ChatMessageRequest = { message };
    // console.log(`Sending chat message to room ${roomId}: ${message}`);

    try {
      this.stompClient.publish({
        destination: `/app/room/${roomId}/chat`,
        body: JSON.stringify(chatRequest),
        headers: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${Cookie.get("token")}`
        }
      });
      // console.log('Chat message sent successfully');
    } catch (e) {
      console.error('Error sending chat message:', e);
    }
  }

  static syncPlayback(roomId: string, position: number, playing: boolean, eventType: SyncEventType): void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('Cannot sync playback, not connected');
      return;
    }

    const syncEvent: PlaybackSyncEvent = {
      roomId,
      position,
      playing,
      eventType,
    };

    try {
      this.stompClient.publish({
        destination: `/app/room/${roomId}/sync`,
        body: JSON.stringify(syncEvent),
        headers: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${Cookie.get("token")}`
        }
      });
      // console.log('Sync event sent successfully');
    } catch (e) {
      console.error('Error sending sync event:', e);
    }
  }

  private static handleChatMessage(message: Message): void {
    try {
      const chatMessage = JSON.parse(message.body) as ChatMessage;
      this.chatMessageListeners.forEach(listener => listener(chatMessage));
    } catch (error) {
      console.error('Error parsing chat message:', error);
    }
  }

  private static handleSyncEvent(message: Message): void {
    try {
      const syncEvent = JSON.parse(message.body) as PlaybackSyncEvent;
      // console.log('Received sync event:', syncEvent);
      this.syncEventListeners.forEach(listener => listener(syncEvent));
    } catch (error) {
      console.error('Error parsing sync event:', error);
    }
  }

  private static handleRoomUpdate(message: Message): void {
    try {
      const roomUpdate = JSON.parse(message.body) as WatchPartyRoom;
      // console.log('Received room update:', roomUpdate);
      this.roomUpdateListeners.forEach(listener => listener(roomUpdate));
    } catch (error) {
      console.error('Error parsing room update:', error);
    }
  }

  // Methods to add and remove event listeners
  static addChatMessageListener(listener: (message: ChatMessage) => void): void {
    this.chatMessageListeners.push(listener);
  }

  static removeChatMessageListener(listener: (message: ChatMessage) => void): void {
    const index = this.chatMessageListeners.indexOf(listener);
    if (index !== -1) {
      this.chatMessageListeners.splice(index, 1);
    }
  }

  static addSyncEventListener(listener: (event: PlaybackSyncEvent) => void): void {
    this.syncEventListeners.push(listener);
  }

  static removeSyncEventListener(listener: (event: PlaybackSyncEvent) => void): void {
    const index = this.syncEventListeners.indexOf(listener);
    if (index !== -1) {
      this.syncEventListeners.splice(index, 1);
    }
  }
  
  static addRoomUpdateListener(listener: (room: WatchPartyRoom) => void): void {
    this.roomUpdateListeners.push(listener);
  }

  static removeRoomUpdateListener(listener: (room: WatchPartyRoom) => void): void {
    const index = this.roomUpdateListeners.indexOf(listener);
    if (index !== -1) {
      this.roomUpdateListeners.splice(index, 1);
    }
  }

  static addConnectionStatusListener(listener: (connected: boolean) => void): void {
    this.connectionStatusListeners.push(listener);
  }

  static removeConnectionStatusListener(listener: (connected: boolean) => void): void {
    const index = this.connectionStatusListeners.indexOf(listener);
    if (index !== -1) {
      this.connectionStatusListeners.splice(index, 1);
    }
  }

  static addHostSyncRequestListener(listener: (event: any) => void): void {
    this.hostSyncRequestListeners.push(listener);
  }
  
  static removeHostSyncRequestListener(listener: (event: any) => void): void {
    this.hostSyncRequestListeners = this.hostSyncRequestListeners.filter(l => l !== listener);
  }
}