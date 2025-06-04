import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, MessageType } from '../../../models/WatchPartyModel';
import { FiFlag, FiMessageCircle, FiMoreVertical, FiSend, FiTrash2, FiUserX } from 'react-icons/fi';
import Avatar from '../../../components/UI/user/Avatar';
import defaultAvatar from '../../../assets/images/default_avatar.jpg';
import useTimeAgo from '../../../hooks/useTimeAgo';
import { useClickOutside } from '../../../hooks/useClickOutside';
import ReportModal from '../../../components/modals/report/ReportModal';
import { ReportType } from '../../../models/Report';
import KickBanUserModal from '../../../components/modals/watchParty/KickBanUserModal';
import { useLanguage } from '../../../context/LanguageContext';

interface WatchPartyChatProps {
  messages: ChatMessage[];
  isConnected: boolean;
  isHost: boolean;
  currentUserId: string;
  roomId: string;
  allowChat: boolean;
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
  allowChat,
  onSendMessage,
  onKickUser,
  onBanUser,
  onDeleteMessage
}) => {
  const { language } = useLanguage();
  const [message, setMessage] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    messageId: string;
    userId: string;
    username: string;
    isOwnMessage: boolean;
    avatarUrl?: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    messageId: '',
    userId: '',
    username: '',
    isOwnMessage: false,
    avatarUrl: undefined
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

  const [kickBanModal, setKickBanModal] = useState<{
    isOpen: boolean;
    type: 'kick' | 'ban';
    userId: string;
    username: string;
    avatarUrl?: string;
    loading: boolean;
  }>({
    isOpen: false,
    type: 'kick',
    userId: '',
    username: '',
    avatarUrl: undefined,
    loading: false
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
    
    if (!allowChat && !isHost) {
      return;
    }

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
      isOwnMessage,
      avatarUrl: msg.avatarUrl
    });
  };

  const handleKick = () => {
    setKickBanModal({
      isOpen: true,
      type: 'kick',
      userId: contextMenu.userId,
      username: contextMenu.username,
      avatarUrl: contextMenu.avatarUrl,
      loading: false
    });
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleBan = () => {
    setKickBanModal({
      isOpen: true,
      type: 'ban',
      userId: contextMenu.userId,
      username: contextMenu.username,
      avatarUrl: contextMenu.avatarUrl,
      loading: false
    });
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleKickBanConfirm = (reason: string) => {
    setKickBanModal(prev => ({ ...prev, loading: true }));
    
    try {
      if (kickBanModal.type === 'kick') {
        onKickUser(kickBanModal.userId, reason);
      } else {
        onBanUser(kickBanModal.userId, reason);
      }
      
      setKickBanModal(prev => ({ ...prev, isOpen: false, loading: false }));
    } catch (error) {
      setKickBanModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleKickBanClose = () => {
    if (!kickBanModal.loading) {
      setKickBanModal(prev => ({ ...prev, isOpen: false }));
    }
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

  const getChatInputProps = () => {
    if (!isConnected) {
      return {
        placeholder: "Connecting...",
        disabled: true
      };
    }
    
    if (!allowChat && !isHost) {
      return {
        placeholder: "Chat has been disabled by the host",
        disabled: true
      };
    }
    
    return {
      placeholder: `${language.watchParty.chat.placeholder}`,
      disabled: false
    };
  };

  const chatInputProps = getChatInputProps();

  return (
    <>
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col h-[600px]">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FiMessageCircle size={16} />
            {language.watchParty.chat.header}
          </h3>
          <div className="flex items-center gap-2">
            {/* Chat status indicator */}
            <span className={`text-xs px-2 py-1 rounded ${
              isConnected 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {isConnected ? language.watchParty.chat.status.connected : language.watchParty.chat.status.disconnected}
            </span>
          </div>
        </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p className="text-center">{language.watchParty.chat.noMessages}</p>
            <p className="text-sm text-center">{language.watchParty.chat.startChat}</p>
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
      
      {/* Chat input section */}
        <div className={`border-t border-gray-200 dark:border-gray-700 p-3 ${
          !allowChat && !isHost ? 'bg-gray-50 dark:bg-gray-700/50' : ''
        }`}>
          {/* Show disabled message if chat is disabled */}
          {!allowChat && !isHost && (
            <div className="mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                <FiMessageCircle size={14} />
                <span className="text-xs font-medium">
                  {language.watchParty.chat.disabledChat}
                </span>
              </div>
            </div>
          )}
          
          <form 
            className="flex gap-2"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={chatInputProps.placeholder}
              disabled={chatInputProps.disabled}
              className={`flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors ${
                chatInputProps.disabled 
                  ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed text-gray-500 dark:text-gray-500' 
                  : ''
              }`}
            />
            <button
              type="submit"
              disabled={chatInputProps.disabled || !message.trim()}
              className={`p-2 rounded-lg transition-colors ${
                chatInputProps.disabled || !message.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              title={!allowChat && !isHost ? "Chat is disabled" : "Send message"}
            >
              <FiSend />
            </button>
          </form>
        </div>

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
                {language.watchParty.chat.deleteMessage}
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
                {language.watchParty.chat.reportUser}
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
                {language.watchParty.chat.kickUser}
              </button>
              <button
                onClick={handleBan}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <FiUserX size={14} />
                {language.watchParty.chat.banUser}
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

    <KickBanUserModal
      isOpen={kickBanModal.isOpen}
      onClose={handleKickBanClose}
      onConfirm={handleKickBanConfirm}
      type={kickBanModal.type}
      username={kickBanModal.username}
      avatarUrl={kickBanModal.avatarUrl}
      loading={kickBanModal.loading}
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
  const {language} = useLanguage();
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
            {isOwnMessage && <span className="text-xs text-gray-500 ml-1">({language.watchParty.chat.you})</span>}
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