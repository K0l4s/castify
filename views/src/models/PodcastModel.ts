import { UserSimple } from "./User";
export interface SolutionModel{
  solution:number;
  url:string;
}
export interface Podcast {
  id: string;
  title: string;
  content: string;
  thumbnailUrl: string | null;
  videoUrl: string;
  genres?: Genre[];
  views: number;
  duration: number;
  totalLikes: number;
  totalComments: number;
  username: string;
  createdDay: string;
  lastEdited: string;
  user: UserSimple;
  active: boolean;
  liked: boolean;
  solutionModelList: SolutionModel[];
}

export interface PodcastResponse {
  content: Podcast[];
  totalPages: number;
  currentPage: number;
}

export interface Genre {
  id: string;
  name: string;
}