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
  private static kickedListeners: ((data: any) => void)[] = [];
  private static bannedListeners: ((data: any) => void)[] = [];
  private static messageDeletedListeners: ((data: any) => void)[] = [];
  private static settingsUpdateListeners: Array<(data: any) => void> = [];
  private static roomClosedListeners: ((data: any) => void)[] = [];
  private static podcastChangedListeners: ((data: any) => void)[] = [];
  private static expirationUpdateListeners: ((data: any) => void)[] = [];

  static async createRoom(request: CreateRoomRequest): Promise<WatchPartyRoom> {
    try {
      const response = await axiosInstanceAuth.post(`/api/v1/watch-party/create`, request);
      return response.data;
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  }

  static async editRoom(roomId: string, settings: {
    roomName: string;
    publish: boolean;
    allowChat: boolean;
  }): Promise<any> {
    try {
      const response = await axiosInstanceAuth.put(`/api/v1/watch-party/${roomId}/edit`, settings);
      return response.data;
    } catch (error) {
      console.error('Error editing room:', error);
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

  static async leaveRoom(roomId: string, useKeepalive: boolean = false): Promise<void> {
    try {
      if (useKeepalive) {
        // Use keepalive for page unload scenarios
        const token = Cookie.get("token");
        await fetch(`${BaseApi}/api/v1/watch-party/leave/${roomId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '69420'
          },
          body: JSON.stringify({}),
          keepalive: true
        });
      } else {
        // Use normal axiosInstanceAuth for regular scenarios
        await axiosInstanceAuth.post(`/api/v1/watch-party/leave/${roomId}`);
      }
    } catch (error) {
      console.error("Error leaving room:", error);
      throw error;
    }
  }

  static async closeRoom(roomId: string): Promise<void> {
    try {
      await axiosInstanceAuth.post(`/api/v1/watch-party/close/${roomId}`);
    } catch (error) {
      console.error("Error closing room:", error);
      throw error;
    }
  }

  static async changePodcast(roomId: string, podcastId: string): Promise<WatchPartyRoom> {
    try {
      const response = await axiosInstanceAuth.post(`/api/v1/watch-party/${roomId}/change-podcast`, {
        podcastId
      });
      return response.data;
    } catch (error) {
      console.error("Error changing podcast:", error);
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

  static async getPublicRooms(page: number = 0, size: number = 10, excludeMyRooms: boolean = true): Promise<{
    content: WatchPartyRoom[];
    size: number;
    currentPage: number;
    totalPages: number;
    totalElements: number;
  }> {
    try {
      const response = await axiosInstanceAuth.get(`/api/v1/watch-party/public?page=${page}&size=${size}&excludeMyRooms=${excludeMyRooms}`);
      return response.data;
    } catch (error) {
      console.error("Error getting public rooms:", error);
      throw error;
    }
  }


  static async getMyRooms(page: number = 0, size: number = 10): Promise<{
    content: WatchPartyRoom[];
    size: number;
    currentPage: number;
    totalPages: number;
    totalElements: number;
  }> {
    try {
      const response = await axiosInstanceAuth.get(`/api/v1/watch-party/my-rooms?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error("Error getting my rooms:", error);
      throw error;
    }
  }

  static async getRoomByCode(roomCode: string): Promise<WatchPartyRoom> {
    try {
      const response = await axiosInstanceAuth.get(`/api/v1/watch-party/room/${roomCode}`);
      return response.data;
    } catch (error) {
      console.error("Error getting room by code:", error);
      throw error;
    }
  }

  static async getRoomMessages(roomId: string, page: number = 0, size: number = 50): Promise<ChatMessage[]> {
    try {
      const response = await axiosInstanceAuth(`/api/v1/watch-party/${roomId}/messages?page=${page}&size=${size}`);

      return response.data.map((msg: any) => ({
        id: msg.id,
        roomId: msg.roomId,
        userId: msg.userId,
        username: msg.username,
        avatarUrl: msg.avatarUrl,
        message: msg.message,
        type: msg.type,
        timestamp: msg.timestamp
      }));
    } catch (error) {
      console.error('Error fetching room messages:', error);
      throw error;
    }
  }

  // Moderation methods
  static async kickUser(roomId: string, userId: string, reason?: string): Promise<void> {
    try {
      await axiosInstanceAuth.post(`/api/v1/watch-party/${roomId}/kick`, {
        userId,
        reason
      });
    } catch (error) {
      console.error("Error kicking user:", error);
      throw error;
    }
  }

  static async banUser(roomId: string, userId: string, reason?: string): Promise<void> {
    try {
      await axiosInstanceAuth.post(`/api/v1/watch-party/${roomId}/ban`, {
        userId,
        reason
      });
    } catch (error) {
      console.error("Error banning user:", error);
      throw error;
    }
  }

  static async unbanUser(roomId: string, userId: string): Promise<void> {
    try {
      await axiosInstanceAuth.post(`/api/v1/watch-party/${roomId}/unban`, {
        userId
      });
    } catch (error) {
      console.error("Error unbanning user:", error);
      throw error;
    }
  }

  static async getBannedUsers(roomId: string): Promise<any[]> {
  try {
    const response = await axiosInstanceAuth.get(`/api/v1/watch-party/${roomId}/banned-users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching banned users:', error);
    throw error;
  }
}

  static async deleteMessage(roomId: string, messageId: string): Promise<void> {
    try {
      await axiosInstanceAuth.delete(`/api/v1/watch-party/${roomId}/messages/${messageId}`);
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  }

  // Extend
  static async extendRoom(roomId: string, additionalHours: number = 4): Promise<WatchPartyRoom> {
    try {
      const response = await axiosInstanceAuth.post(`/api/v1/watch-party/${roomId}/extend`, {}, {
        params: { additionalHours }
      });
      return response.data;
    } catch (error) {
      console.error("Error extending room:", error);
      throw error;
    }
  }

  // Add get expiration info method
  static async getRoomExpirationInfo(roomId: string): Promise<{
    expiresAt: string;
    minutesRemaining: number;
    isExpiringSoon: boolean;
    canExtend: boolean;
  }> {
    try {
      const response = await axiosInstanceAuth.get(`/api/v1/watch-party/${roomId}/expiration`);
      return response.data;
    } catch (error) {
      console.error("Error getting expiration info:", error);
      throw error;
    }
  }

  // Admin methods (optional)
  static async forceCleanup(): Promise<{ expiredRooms: number; message: string }> {
    try {
      const response = await axiosInstanceAuth.post(`/api/v1/admin/watch-party/cleanup`);
      return response.data;
    } catch (error) {
      console.error("Error force cleanup:", error);
      throw error;
    }
  }

  static async getRoomsExpiringSoon(): Promise<WatchPartyRoom[]> {
    try {
      const response = await axiosInstanceAuth.get(`/api/v1/admin/watch-party/expiring-soon`);
      return response.data;
    } catch (error) {
      console.error("Error getting expiring rooms:", error);
      throw error;
    }
  }

  // Socket
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
        //   if (str.includes('kick') || str.includes('ban') || str.includes('queue')) {
        //     console.log('🔥 STOMP Debug:', str);
        //   }
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
        
        // Subscribe to room closed notifications
        this.stompClient!.subscribe(`/topic/room/${roomId}/closed`, (message) => {
          try {
            const closedData = JSON.parse(message.body);
            this.roomClosedListeners.forEach(listener => {
              // console.log('Calling room closed listener');
              listener(closedData);
            });
          } catch (error) {
            console.error('ERROR PARSING CLOSED DATA:', error);
          }
        }, subscribeHeaders);

        // Subscribe to podcast change notifications
        this.stompClient!.subscribe(`/topic/room/${roomId}/podcast-changed`, (message) => {
          try {
            const podcastChangeData = JSON.parse(message.body);
            this.podcastChangedListeners.forEach(listener => listener(podcastChangeData));
          } catch (error) {
            console.error('Error parsing podcast change data:', error);
          }
        }, subscribeHeaders);

        this.stompClient!.subscribe(`/topic/room/${roomId}/expiration-update`, (message) => {
          try {
            const expirationData = JSON.parse(message.body);
            this.expirationUpdateListeners.forEach(listener => listener(expirationData));
          } catch (error) {
            console.error('Error parsing expiration update data:', error);
          }
        }, subscribeHeaders);

        this.stompClient!.subscribe(`/topic/room/${roomId}/kick`, (message) => {
          try {
            const kickData = JSON.parse(message.body);
            
            // handle the filtering
            this.kickedListeners.forEach((listener) => {
              listener(kickData);
            });
          } catch (error) {
            console.error('Error parsing data:', error);
          }
        }, subscribeHeaders);

        this.stompClient!.subscribe(`/topic/room/${roomId}/ban`, (message) => {
          try {
            const banData = JSON.parse(message.body);
            
            // handle the filtering
            this.bannedListeners.forEach((listener) => {
              listener(banData);
            });
          } catch (error) {
            console.error('Error parsing data', error);
          }
        }, subscribeHeaders);

        this.stompClient!.subscribe(`/topic/room/${roomId}/message-deleted`, (message) => {
          const deleteData = JSON.parse(message.body);
          this.messageDeletedListeners.forEach(listener => listener(deleteData));
        });

        // Settings update subscription
        this.stompClient!.subscribe(`/topic/room/${roomId}/settings-update`, (message) => {
          const data = JSON.parse(message.body);
          this.settingsUpdateListeners.forEach(listener => listener(data));
        });

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

  static addKickedListener(listener: (data: any) => void) {
    this.kickedListeners.push(listener);
  }

  static removeKickedListener(listener: (data: any) => void) {
    this.kickedListeners = this.kickedListeners.filter(l => l !== listener);
  }

  static addBannedListener(listener: (data: any) => void) {
    this.bannedListeners.push(listener);
  }

  static removeBannedListener(listener: (data: any) => void) {
    this.bannedListeners = this.bannedListeners.filter(l => l !== listener);
  }

  static addMessageDeletedListener(listener: (data: any) => void) {
    this.messageDeletedListeners.push(listener);
  }

  static removeMessageDeletedListener(listener: (data: any) => void) {
    this.messageDeletedListeners = this.messageDeletedListeners.filter(l => l !== listener);
  }

  static addSettingsUpdateListener(listener: (data: any) => void) {
    this.settingsUpdateListeners.push(listener);
  }

  static removeSettingsUpdateListener(listener: (data: any) => void) {
    this.settingsUpdateListeners = this.settingsUpdateListeners.filter(l => l !== listener);
  }

  static addRoomClosedListener(listener: (data: any) => void): void {
    this.roomClosedListeners.push(listener);
  }

  static removeRoomClosedListener(listener: (data: any) => void): void {
    const index = this.roomClosedListeners.indexOf(listener);
    if (index > -1) {
      this.roomClosedListeners.splice(index, 1);
    }
  }

  static addPodcastChangedListener(listener: (data: any) => void): void {
    this.podcastChangedListeners.push(listener);
  }

  static removePodcastChangedListener(listener: (data: any) => void): void {
    const index = this.podcastChangedListeners.indexOf(listener);
    if (index > -1) {
      this.podcastChangedListeners.splice(index, 1);
    }
  }

  static addExpirationUpdateListener(listener: (data: any) => void): void {
    this.expirationUpdateListeners.push(listener);
  }

  static removeExpirationUpdateListener(listener: (data: any) => void): void {
    const index = this.expirationUpdateListeners.indexOf(listener);
    if (index > -1) {
      this.expirationUpdateListeners.splice(index, 1);
    }
  }
}