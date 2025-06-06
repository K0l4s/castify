import React from 'react'
import { FullMemberInfor, Message } from '../../../models/Conversation'
import { formatDistanceToNow } from "date-fns";
import { User } from '../../../models/User';
import Avatar from '../../UI/user/Avatar';

interface MessageItemProps {
    msg: Message;
    currentUser: User | null;
    members: FullMemberInfor[];
}

const MessageItem: React.FC<MessageItemProps> = ({ msg, currentUser, members }) => {
    // Lấy danh sách những người đã đọc
    // console.log(msg.sender.id);
    const readers = members.filter(member =>
        member.lastReadMessage?.lastMessageId === msg.id
        && member.members.id !== currentUser?.id
    );
    // console.log(readers);
    return (
        <div
            key={msg.id}
            className={`flex flex-col gap-2 px-4 py-2 ${
            msg.sender.id === currentUser?.id ? "items-end" : "items-start"
            }`}
        >
            <div className={`flex items-end gap-3 ${msg.sender.id === currentUser?.id ? "flex-row-reverse" : ""}`}>
            {msg.sender.id !== currentUser?.id && (
                <Avatar
                width="w-10"
                height="h-10"
                avatarUrl={
                    msg.sender?.avatarUrl
                    ? msg.sender.avatarUrl
                    : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-uwAPsc9m6frK85uQog_CeCpOwlfgpsjZKA&s"
                }
                usedFrame={msg.sender?.usedFrame}
                />
            )}
            <div className={`flex flex-col max-w-lg ${msg.sender.id === currentUser?.id ? "items-end" : "items-start"}`}>
                <span className="font-semibold text-sm text-gray-800 dark:text-gray-100 mb-1">
                {msg.sender.fullname}
                </span>
                <span
                className={`px-4 py-2 rounded-2xl shadow-md text-base break-words ${
                    msg.sender.id === currentUser?.id
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                }`}
                >
                {msg.content}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                </span>
            </div>
            </div>
            {readers.length > 0 && (
            <div className={`flex gap-1 mt-2 ${msg.sender.id === currentUser?.id ? "justify-end" : "justify-start"}`}>
                {readers.map(reader => (
                <Avatar
                    key={reader.members.id}
                    width="w-5"
                    height="h-5"
                    avatarUrl={reader.members.avatarUrl}
                    usedFrame={reader.members.usedFrame}
                />
                ))}
                <span className="text-xs text-gray-400 ml-2">{readers.length > 1 ? "Đã xem" : "Đã xem"}</span>
            </div>
            )}
        </div>
    )
}

export default MessageItem;
