import React from 'react';
import { FaCrown, FaEllipsisV } from 'react-icons/fa';
import Avatar from '../../UI/user/Avatar';
import defaultAvatar from "../../../assets/images/default_avatar.jpg";
import { useLanguage } from '../../../context/LanguageContext';

interface HostItemProps {
  hostParticipant: any;
  currentUserId?: string;
  onMenuClick: (e: React.MouseEvent, participant: any) => void;
  getDisplayName: (participant: any) => string;
}

const HostItem: React.FC<HostItemProps> = ({
  hostParticipant,
  currentUserId,
  onMenuClick,
  getDisplayName
}) => {
  const { language } = useLanguage();

  return (
    <div 
      className={`group flex items-center gap-2 p-2 rounded-lg ${
        hostParticipant.userId === currentUserId 
          ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50' 
          : 'bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/40'
      }`}
    >
      <Avatar
        width="w-8"
        height="h-8"
        avatarUrl={hostParticipant?.avatarUrl || defaultAvatar}
        alt={getDisplayName(hostParticipant)}
        userFrameUrl={hostParticipant?.userFrameUrl}
      />
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-gray-900 dark:text-white">
            {getDisplayName(hostParticipant)}
          </span>
          <FaCrown className="text-yellow-500" size={14} />
          <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-2 py-0.5 rounded-full ml-1">
            {language.watchParty.participant.host}
          </span>
          {hostParticipant.userId === currentUserId && (
            <span className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 px-2 py-0.5 rounded-full ml-1">
              {language.watchParty.participant.you}
            </span>
          )}
        </div>
      </div>

      {/* Menu Button - Only show for other users */}
      {hostParticipant.userId !== currentUserId && (
        <div className="flex-shrink-0">
          <button 
            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-all duration-200"
            onClick={(e) => onMenuClick(e, hostParticipant)}
            title="More options"
            type="button"
          >
            <FaEllipsisV size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

export default HostItem;