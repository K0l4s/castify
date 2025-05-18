import { User } from "./User";

export interface PlaylistItem {
  podcastId: string;
  thumbnail: string;
  duration: number;
  order: number;
}

export interface PlaylistModel {
  id: string;
  name: string;
  description: string;
  thumbnail: string | null;
  totalItems: number;
  publish: boolean;
  lastUpdated: string;
  createdAt: string;
  owner: User;
  items: PlaylistItem[];
}

export interface CreatePlaylistDTO {
  name: string;
  description: string;
  publish: boolean;
}