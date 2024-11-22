export interface Podcast {
  id: string;
  title: string;
  content: string;
  thumbnailUrl: string | null;
  videoUrl: string;
  views: number;
  totalLikes: number;
  totalComments: number;
  username: string;
  createdDay: string;
  lastEdited: string;
  active: boolean;
}

export interface PodcastResponse {
  podcasts: Podcast[];
  totalPages: number;
  currentPage: number;
}