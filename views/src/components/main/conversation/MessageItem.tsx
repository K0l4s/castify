import React from 'react'
import { FullMemberInfor, Message } from '../../../models/Conversation'
import { formatDistanceToNow } from "date-fns";
import { User } from '../../../models/User';

interface MessageItemProps {
    msg: Message;
    currentUser: User | null;
    members: FullMemberInfor[];
}

const MessageItem: React.FC<MessageItemProps> = ({ msg, currentUser, members }) => {
    // Lấy danh sách những người đã đọc
    console.log(msg.sender.id);
    const readers = members.filter(member =>
        member.lastReadMessage?.lastMessageId === msg.id
    );
    console.log(readers);
    return (
        <div
            key={msg.id}
            className={`flex flex-col gap-1 ${msg.sender.id === currentUser?.id ? "items-end" : "items-start"}`}
        >
            <div className={`flex gap-2 ${msg.sender.id === currentUser?.id ? "justify-end" : ""}`}>
                {msg.sender.id !== currentUser?.id && (
                    <img
                        src={msg.sender?.avatarUrl ? msg.sender.avatarUrl : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-uwAPsc9m6frK85uQog_CeCpOwlfgpsjZKA&s"}
                        alt={msg.sender.fullname}
                        className="w-10 h-10 rounded-full"
                    />
                )}
                <div className={`flex flex-col ${msg.sender.id === currentUser?.id ? "items-end" : "items-start"}`}>
                    <span className="font-semibold text-black dark:text-white">{msg.sender.fullname}</span>
                    <span
                        className={`p-2 max-w-5xl rounded-lg ${msg.sender.id === currentUser?.id
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
                            }`}
                    >
                        {msg.content}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                    </span>
                </div>
            </div>
            {readers.length > 0 && (
                <div className="flex gap-1 mt-1 px-20">
                    {readers.map(reader => (
                        <img
                            key={reader.members.id}
                            src={reader.members.avatarUrl}
                            alt={reader.members.fullname}
                            className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-800"
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default MessageItem;
