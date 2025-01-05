import { shortUser } from "./User";

export interface CreateConversationProps {
    title: string;
    // name: string;
    memberList: {
        memberId: string;
        role: string;
        joinTime: string;
    }[];
}

export interface shortConversation {
    id: string;
    title: string;
    imageUrl: string;
    memberSize: number;
    lastMessage: string;
    lastMessageTimestamp: string;
}

export interface Message {
    id: string;
    sender: shortUser;
    content: string;
    timestamp: string;
}