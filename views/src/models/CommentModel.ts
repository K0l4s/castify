import { UserSimple } from "./User";

export interface Comment {
  id: string;
  content: string;
  totalLikes: number;
  totalReplies: number;
  timestamp: string;
  user: UserSimple;
  liked: boolean;
}