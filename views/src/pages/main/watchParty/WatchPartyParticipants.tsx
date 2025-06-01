import React, { useRef, useState } from 'react';
import { WatchPartyRoom } from '../../../models/WatchPartyModel';
import { FiFlag, FiUserX } from 'react-icons/fi';
import { useClickOutside } from '../../../hooks/useClickOutside';
import HostItem from '../../../components/modals/watchParty/HostItem';
import ParticipantItem from '../../../components/modals/watchParty/ParticipantItem';

interface WatchPartyParticipantsProps {
  room: WatchPartyRoom;
  currentUserId?: string;
  isHost?: boolean;
  onKickUser?: (userId: string, reason?: string) => void;
  onBanUser?: (userId: string, reason?: string) => void;
  onReportUser?: (userId: string, reason: string) => void;
}

const WatchPartyParticipants: React.FC<WatchPartyParticipantsProps> = ({ 
  room,
  currentUserId,
  isHost = false,
  onKickUser,
  onBanUser,
  onReportUser
}) => {
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    userId: string;
    username: string;
    isOwnProfile: boolean;
  }>({
    visible: false,
    x: 0,
    y: 0,
    userId: '',
    username: '',
    isOwnProfile: false
  });

  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Safe getter for display name
  const getDisplayName = (participant: any) => {
    if (!participant) return 'Unknown';
    return participant.username || participant.fullName || 'Unknown';
  };

  // Safe check for participants array
  const participants = room.participants || [];
  
  // Find host participant
  const hostParticipant = participants.find(p => p.userId === room.hostUserId);
  
  useClickOutside(contextMenuRef, () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  });

  const handleMenuClick = (e: React.MouseEvent, participant: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Don't show menu for own profile
    if (participant.userId === currentUserId) {
      return;
    }

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const isOwnProfile = participant.userId === currentUserId;
    
    setContextMenu({
      visible: true,
      x: rect.right - 150,
      y: rect.bottom + 5,
      userId: participant.userId || '',
      username: getDisplayName(participant),
      isOwnProfile
    });
  };

  const handleKick = () => {
    const reason = prompt(`Enter reason for kicking ${contextMenu.username}:`);
    if (reason !== null && onKickUser) {
      onKickUser(contextMenu.userId, reason);
    }
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleBan = () => {
    const reason = prompt(`Enter reason for banning ${contextMenu.username}:`);
    if (reason !== null && onBanUser) {
      onBanUser(contextMenu.userId, reason);
    }
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleReport = () => {
    const reason = prompt(`Enter reason for reporting ${contextMenu.username}:`);
    if (reason !== null && reason.trim() && onReportUser) {
      onReportUser(contextMenu.userId, reason);
    }
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Participants ({participants.length})
        </h3>
      </div>
      
      <div className="p-2 max-h-[200px] overflow-y-auto">
        <div className="space-y-2">
          {/* ✅ Host first - Sử dụng component riêng */}
          {hostParticipant && (
            <HostItem
              key={`host-${hostParticipant.id}`}
              hostParticipant={hostParticipant}
              currentUserId={currentUserId}
              onMenuClick={handleMenuClick}
              getDisplayName={getDisplayName}
            />
          )}
          
          {/* ✅ Other participants - Sử dụng component riêng */}
          {participants
            .filter(p => p.userId !== room.hostUserId)
            .map(participant => (
              <ParticipantItem
                key={`participant-${participant.id}`}
                participant={participant}
                currentUserId={currentUserId}
                onMenuClick={handleMenuClick}
                getDisplayName={getDisplayName}
              />
            ))}
            
          {participants.length <= 1 && (
            <div className="text-center py-2 text-gray-500 dark:text-gray-400 text-sm">
              No other participants yet. Share the room code to invite friends!
            </div>
          )}
        </div>
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
          {/* Report options (for all users) */}
          <button
            onClick={handleReport}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <FiFlag size={14} />
            Report User
          </button>

          {/* Host options (only for hosts) */}
          {isHost && (
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
  );
};

export default WatchPartyParticipants;