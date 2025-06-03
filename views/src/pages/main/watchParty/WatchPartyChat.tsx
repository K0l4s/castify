import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, MessageType } from '../../../models/WatchPartyModel';
import { FiFlag, FiMoreVertical, FiSend, FiTrash2, FiUserX } from 'react-icons/fi';
import Avatar from '../../../components/UI/user/Avatar';
import defaultAvatar from '../../../assets/images/default_avatar.jpg';
import useTimeAgo from '../../../hooks/useTimeAgo';
import { useClickOutside } from '../../../hooks/useClickOutside';
import ReportModal from '../../../components/modals/report/ReportModal';
import { ReportType } from '../../../models/Report';
// import { useLanguage } from '../../../context/LanguageContext';

interface WatchPartyChatProps {
  messages: ChatMessage[];
  isConnected: boolean;
  isHost: boolean;
  currentUserId: string;
  roomId: string;
  onSendMessage: (message: string) => void;
  onKickUser: (userId: string, reason?: string) => void;
  onBanUser: (userId: string, reason?: string) => void;
  onReportMessage: (messageId: string, reason: string) => void;
  onReportUser: (userId: string, reason: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

const WatchPartyChat: React.FC<WatchPartyChatProps> = ({ 
  messages, 
  isConnected,
  isHost,
  currentUserId,
  onSendMessage,
  onKickUser,
  onBanUser,
  onDeleteMessage
}) => {
  const [message, setMessage] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    messageId: string;
    userId: string;
    username: string;
    isOwnMessage: boolean;
  }>({
    visible: false,
    x: 0,
    y: 0,
    messageId: '',
    userId: '',
    username: '',
    isOwnMessage: false
  });

  const [reportModal, setReportModal] = useState<{
    isOpen: boolean;
    type: string;
    targetId: string;
  }>({
    isOpen: false,
    type: 'user',
    targetId: ''
  });

  const contextMenuRef = useRef<HTMLDivElement>(null);
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

  // Close context menu when clicking outside
  useClickOutside(contextMenuRef, () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  });

  const handleMenuClick = (e: React.MouseEvent, msg: ChatMessage) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (msg.type === MessageType.SYSTEM) {
      return;
    }

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const isOwnMessage = msg.userId === currentUserId;
    
    setContextMenu({
      visible: true,
      x: rect.right - 150,
      y: rect.bottom + 5,
      messageId: msg.id || '',
      userId: msg.userId || '',
      username: msg.username || '',
      isOwnMessage
    });
  };

  const handleKick = () => {
    const reason = prompt(`Enter reason for kicking ${contextMenu.username}:`);
    if (reason !== null) {
      onKickUser(contextMenu.userId, reason);
    }
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleBan = () => {
    const reason = prompt(`Enter reason for banning ${contextMenu.username}:`);
    if (reason !== null) {
      onBanUser(contextMenu.userId, reason);
    }
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleReport = (type: string) => {
    const targetId = contextMenu.userId;
    
    setReportModal({
      isOpen: true,
      type,
      targetId
    });
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleReportClose = () => {
    setReportModal({
      isOpen: false,
      type: 'user',
      targetId: ''
    });
  };
  
  const handleDelete = () => {
    if (onDeleteMessage && contextMenu.messageId) {
      const confirmed = confirm('Are you sure you want to delete this message?');
      if (confirmed) {
        onDeleteMessage(contextMenu.messageId);
      }
    }
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  return (
    <>
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
            <ChatMessageItem 
              key={index} 
              message={msg} 
              onMenuClick={handleMenuClick}
              showContextMenu={msg.type !== MessageType.SYSTEM}
              currentUserId={currentUserId}
              isHost={isHost}
            />
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

      {/* Context Menu */}
      {contextMenu.visible && (
        <div 
          ref={contextMenuRef}
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[150px]"
          style={{ 
            left: Math.max(10, Math.min(contextMenu.x, window.innerWidth - 170)), 
            top: Math.max(10, Math.min(contextMenu.y, window.innerHeight - 200))
          }}
        >
          {/* Own message options */}
          {contextMenu.isOwnMessage && onDeleteMessage && (
            <>
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <FiTrash2 size={14} />
                Delete Message
              </button>
              <hr className="my-1 border-gray-200 dark:border-gray-700" />
            </>
          )}

          {/* Report options (for other users' messages) */}
          {!contextMenu.isOwnMessage && (
            <>
              <button
                onClick={() => handleReport('user')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <FiFlag size={14} />
                Report User
              </button>
            </>
          )}

          {/* Host options (for other users only) */}
          {isHost && !contextMenu.isOwnMessage && (
            <>
              <hr className="my-1 border-gray-200 dark:border-gray-700" />
              <button
                onClick={handleKick}
                className="w-full px-4 py-2 text-left text-sm text-orange-600 dark:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <FiUserX size={14} />
                Kick User
              </button>
              <button
                onClick={handleBan}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <FiUserX size={14} />
                Ban User
              </button>
            </>
          )}
        </div>
      )}
    </div>

    <ReportModal
      isOpen={reportModal.isOpen}
      onClose={handleReportClose}
      targetId={reportModal.targetId}
      reportType={ReportType.U}
    />
    </>
  );
};

interface ChatMessageItemProps {
  message: ChatMessage;
  onMenuClick?: (e: React.MouseEvent, message: ChatMessage) => void;
  showContextMenu?: boolean;
  currentUserId: string;
  isHost?: boolean;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ 
  message,
  onMenuClick,
  showContextMenu = false,
  currentUserId
}) => {
  const timeAgo = useTimeAgo(message.timestamp!);
  
  // Handle system messages differently
  if (message.type === MessageType.SYSTEM) {
    let messageStyle = "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700";
    let icon = "ℹ️";
    
    if (message.message.includes('joined')) {
      messageStyle = "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700";
      icon = "👋";
    } else if (message.message.includes('left')) {
      messageStyle = "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-700";
      icon = "👋";
    } else if (message.message.includes('kicked')) {
      messageStyle = "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700";
      icon = "🚫";
    } else if (message.message.includes('banned')) {
      messageStyle = "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700";
      icon = "🔨";
    } else if (message.message.includes('host')) {
      messageStyle = "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700";
      icon = "👑";
    }
    
    return (
      <div className="flex justify-center my-2">
        <div className={`text-center text-xs py-2 px-4 rounded-full border max-w-xs ${messageStyle}`}>
          <div className="flex items-center justify-center gap-1">
            <span>{icon}</span>
            <span>{message.message}</span>
          </div>
        </div>
      </div>
    );
  }
  
  const isOwnMessage = message.userId === currentUserId;

  return (
    <div className="group flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 -mx-2 rounded-lg transition-colors">
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        <Avatar
          width="w-8"
          height="h-8"
          avatarUrl={message.avatarUrl || defaultAvatar}
          alt={message.username || "User"}
        />
      </div>
      
      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-sm text-gray-900 dark:text-white">
            {message.username || "Anonymous"}
            {isOwnMessage && <span className="text-xs text-gray-500 ml-1">(You)</span>}
          </span>
          {timeAgo && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {timeAgo}
            </span>
          )}
        </div>
        <p className="text-gray-800 dark:text-gray-200 break-words text-sm leading-relaxed">
          {message.message}
        </p>
      </div>
      
      {/* Menu Button */}
      {showContextMenu && (
        <div className="flex-shrink-0 mt-0.5">
          <button 
            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-all duration-200"
            onClick={(e) => onMenuClick?.(e, message)}
            title="More options"
            type="button"
          >
            <FiMoreVertical size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default WatchPartyChat;