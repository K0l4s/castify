import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, MessageType } from '../../../models/WatchPartyModel';
import { FiSend } from 'react-icons/fi';
import Avatar from '../../../components/UI/user/Avatar';
import defaultAvatar from '../../../assets/images/default_avatar.jpg';
import useTimeAgo from '../../../hooks/useTimeAgo';
// import { useLanguage } from '../../../context/LanguageContext';

interface WatchPartyChatProps {
  messages: ChatMessage[];
  isConnected: boolean;
  onSendMessage: (message: string) => void;
}

const WatchPartyChat: React.FC<WatchPartyChatProps> = ({ 
  messages, 
  isConnected, 
  onSendMessage 
}) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // const { language } = useLanguage();
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && isConnected) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col h-[400px]">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900 dark:text-white">Chat</h3>
        <span className={`text-xs px-2 py-1 rounded ${
          isConnected 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p className="text-center">No messages yet</p>
            <p className="text-sm text-center">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessageItem key={index} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form 
        className="border-t border-gray-200 dark:border-gray-700 p-3 flex gap-2"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          disabled={!isConnected}
          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
        />
        <button
          type="submit"
          disabled={!isConnected || !message.trim()}
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <FiSend />
        </button>
      </form>
    </div>
  );
};

interface ChatMessageItemProps {
  message: ChatMessage;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const timeAgo = useTimeAgo(message.timestamp!);
  
  // Handle system messages differently
  if (message.type === MessageType.SYSTEM) {
    return (
      <div className="text-center text-xs py-1 px-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full mx-auto inline-block">
        {message.message}
      </div>
    );
  }
  
  return (
    <div className="flex gap-2">
      <Avatar
        width="w-8"
        height="h-8"
        avatarUrl={message.avatarUrl || defaultAvatar}
        alt={message.username || "User"}
      />
      <div className="flex-1">
        <div className="flex justify-between items-baseline">
          <span className="font-semibold text-sm text-gray-900 dark:text-white">
            {message.username || "Anonymous"}
          </span>
          {timeAgo && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {timeAgo}
            </span>
          )}
        </div>
        <p className="text-gray-800 dark:text-gray-200 break-words">{message.message}</p>
      </div>
    </div>
  );
};

export default WatchPartyChat;