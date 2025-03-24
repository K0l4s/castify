import { shortUser } from "./User";

export interface CreateConversationProps {
    title: string;
    // name: string;
    memberList: {
        memberId: string;
        role: string;
        joinTime: string;
        isAccepted:boolean;
    }[];
}
export interface Message {
    id: string;
    sender: shortUser;
    content: string;
    timestamp: string;
    status?: "sending" | "sent" | "seen";
    read?: boolean;
}
export interface shortConversation {
    id: string;
    title: string;
    imageUrl: string;
    memberSize: number;
    lastMessage?: Message;
    // lastMessage: string;
    // lastMessageTimestamp: string;
}

