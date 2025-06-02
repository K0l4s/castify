import React from 'react';
import { FiUsers, FiGlobe, FiLock, FiClock, FiArrowRight, FiSettings, FiTrash2 } from 'react-icons/fi';
import defaultAvatar from "../../../assets/images/default_avatar.jpg";
import { WatchPartyRoom } from '../../../models/WatchPartyModel';
import Avatar from '../../UI/user/Avatar';
import CustomButton from '../../UI/custom/CustomButton';

interface RoomCardProps {
  room: WatchPartyRoom;
  isMyRoom?: boolean;
  isJoining?: boolean;
  onJoinRoom?: (roomCode: string) => void;
  onSettingsClick?: (room: WatchPartyRoom) => void;
  onDeleteRoom?: (roomId: string) => void;
  currentUserId?: string;
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  isMyRoom = false,
  isJoining = false,
  onJoinRoom,
  onSettingsClick,
  onDeleteRoom,
}) => {
  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Get host info
  const hostParticipant = room.participants?.find(p => p.userId === room.hostUserId);
  const isRoomFull = room.participants?.length >= room.maxParticipants;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden group">
      {/* Room Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Live
            </span>
            {isMyRoom && (
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full font-medium">
                Your Room
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <FiClock size={14} />
            <span className="text-xs">
              {formatTimeAgo(room.createdAt)}
            </span>
          </div>
        </div>

        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3 line-clamp-2" title={room.roomName}>
          {room.roomName}
        </h3>

        {/* Host Info */}
        {hostParticipant && (
          <div className="flex items-center gap-2 mb-4">
            <Avatar
              width="w-8"
              height="h-8"
              avatarUrl={hostParticipant.avatarUrl || defaultAvatar}
              usedFrame={hostParticipant.usedFrame}
              alt={hostParticipant.username}
            />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {hostParticipant.username || hostParticipant.username}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Host
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <FiUsers size={16} />
            <span>{room.participants?.length || 0}/{room.maxParticipants}</span>
          </div>
          <div className="flex items-center gap-1">
            {room.publish ? (
              <>
                <FiGlobe size={16} />
                <span>Public</span>
              </>
            ) : (
              <>
                <FiLock size={16} />
                <span>Private</span>
              </>
            )}
          </div>
        </div>

        {/* Room Code */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Room Code</div>
          <div className="font-mono text-lg font-bold text-gray-900 dark:text-white">
            {room.roomCode}
          </div>
        </div>
      </div>

      {/* Room Footer */}
      <div className="px-6 pb-6">
        {isMyRoom ? (
          <div className="flex gap-2">
            <CustomButton
              text="Join Room"
              icon={<FiArrowRight />}
              variant="primary"
              size="sm"
              className="flex-1"
              disabled={isRoomFull}
              onClick={() => onJoinRoom?.(room.roomCode)}
            />
            <CustomButton
              text=""
              icon={<FiSettings />}
              variant="outline"
              size="sm"
              className="px-3"
              onClick={() => onSettingsClick?.(room)}
            />
            <CustomButton
              text=""
              icon={<FiTrash2 />}
              variant="outline"
              size="sm"
              className="px-3 text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => onDeleteRoom?.(room.id)}
            />
          </div>
        ) : (
          <CustomButton
            text={isJoining ? 'Joining...' : 'Join Room'}
            icon={isJoining ? undefined : <FiArrowRight />}
            variant="primary"
            size="sm"
            className="w-full group-hover:bg-blue-700 transition-colors"
            disabled={isJoining || isRoomFull}
            onClick={() => onJoinRoom?.(room.roomCode)}
          />
        )}
        
        {isRoomFull && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-2 text-center">
            Room is full
          </p>
        )}
      </div>
    </div>
  );
};

export default RoomCard;