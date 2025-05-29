import { User } from "./User";

export interface PlaylistItem {
  podcastId: string;
  thumbnail: string;
  duration: number;
  title: string;
  description: string;
  owner: string;
  order: number;
}

export interface PlaylistModel {
  id: string;
  name: string;
  description: string;
  thumbnail: string | null;
  publish: boolean;
  lastUpdated: string;
  createdAt: string;
  owner: User;
  items: PlaylistItem[];
  totalItems: number;
  hiddenCount: number;
}

export interface CreatePlaylistDTO {
  name: string;
  description: string;
  publish: boolean;
}