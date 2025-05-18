export interface PlaylistModel {
  id: string;
  name: string;
  description: string;
  thumbnail: string | null;
  totalItems: number;
  publish: boolean;
  lastUpdated: string;
}