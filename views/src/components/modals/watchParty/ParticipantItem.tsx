import React from 'react';
import { FaEllipsisV } from 'react-icons/fa';
import defaultAvatar from "../../../assets/images/default_avatar.jpg";
import useTimeAgo from '../../../hooks/useTimeAgo';
import Avatar from '../../UI/user/Avatar';

interface ParticipantItemProps {
  participant: any;
  currentUserId?: string;
  onMenuClick: (e: React.MouseEvent, participant: any) => void;
  getDisplayName: (participant: any) => string;
}

const ParticipantItem: React.FC<ParticipantItemProps> = ({
  participant,
  currentUserId,
  onMenuClick,
  getDisplayName
}) => {
  // ✅ Hook ở top level của component này
  const timeAgo = useTimeAgo(participant.joinedAt);

  return (
    <div 
      className={`group flex items-center gap-2 p-2 rounded-lg ${
        participant.userId === currentUserId 
          ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      <Avatar
        width="w-8"
        height="h-8"
        avatarUrl={participant?.avatarUrl || defaultAvatar}
        usedFrame={participant?.usedFrame}
        alt={getDisplayName(participant)}
      />
      <div className="flex-1">
        <div className="flex items-center">
          <span className="font-medium text-gray-900 dark:text-white">
            {getDisplayName(participant)}
          </span>
          {participant.userId === currentUserId && (
            <span className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 px-2 py-0.5 rounded-full ml-2">
              You
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Joined {timeAgo}
        </div>
      </div>
      
      {/* Menu Button - Only show for other users */}
      {participant.userId !== currentUserId && (
        <div className="flex-shrink-0">
          <button 
            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-all duration-200"
            onClick={(e) => onMenuClick(e, participant)}
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

export default ParticipantItem;