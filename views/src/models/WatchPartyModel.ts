import { UserFrame, UserSimple } from "./User";

export interface WatchPartyRoom {
  id: string;
  roomCode: string;
  roomName: string;
  podcastId: string;
  hostUserId: string;
  host?: UserSimple;
  participants: WatchPartyParticipant[];
  maxParticipants: number;
  currentPosition: number;
  isPublic: boolean;
  createdAt: string;
  lastUpdated: string;
  allowChat: boolean;
}

export interface WatchPartyParticipant {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  usedFrame?: UserFrame;
  user?: UserSimple;
  joinedAt: string;
}

export interface PlaybackSyncEvent {
  roomId?: string; 
  position: number;
  playing: boolean;
  eventType: SyncEventType;
  userId?: string; 
  username?: string;
  timestamp?: string;
}

export enum SyncEventType {
  PLAY = 'PLAY',
  PAUSE = 'PAUSE',
  SEEK = 'SEEK',
  SYNC_REQUEST = 'SYNC_REQUEST'
}

export enum MessageType {
  CHAT = 'CHAT',
  SYSTEM = 'SYSTEM',
  PLAYBACK_SYNC = 'PLAYBACK_SYNC',
  EMOJI_REACTION = 'EMOJI_REACTION'
}

export interface ChatMessage {
  id?: string;
  userId?: string;
  username?: string;
  avatarUrl?: string;
  message: string;
  timestamp?: string;
  type?: MessageType;
}

export interface CreateRoomRequest {
  podcastId: string;
  roomName: string;
  isPublic: boolean;
}

export interface ChatMessageRequest {
  message: string;
}

export interface KickUserRequest {
  userId: string;
  reason?: string;
}

export interface BanUserRequest {
  userId: string;
  reason?: string;
}