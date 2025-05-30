import React from 'react';
import { WatchPartyRoom } from '../../../models/WatchPartyModel';
import Avatar from '../../../components/UI/user/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { FaCrown } from 'react-icons/fa';
import defaultAvatar from "../../../assets/images/default_avatar.jpg";

interface WatchPartyParticipantsProps {
  room: WatchPartyRoom;
  currentUserId?: string;
}

const WatchPartyParticipants: React.FC<WatchPartyParticipantsProps> = ({ 
  room,
  currentUserId 
}) => {
  // Safe getter for display name
  const getDisplayName = (participant: any) => {
    if (!participant) return 'Unknown';
    return participant.username || participant.fullName || 'Unknown';
  };

  // Safe check for participants array
  const participants = room.participants || [];
  
  // Find host participant
  const hostParticipant = participants.find(p => p.userId === room.hostUserId);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Participants ({participants.length})
        </h3>
      </div>
      
      <div className="p-2 max-h-[200px] overflow-y-auto">
        <div className="space-y-2">
          {/* Host first - if host exists */}
          {hostParticipant && (
            <div 
              key={`host-${hostParticipant.id}`}
              className={`flex items-center gap-2 p-2 rounded-lg ${
                hostParticipant.userId === currentUserId 
                  ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50' 
                  : 'bg-blue-50/50 dark:bg-blue-900/20'
              }`}
            >
              <Avatar
                width="w-8"
                height="h-8"
                avatarUrl={hostParticipant?.avatarUrl || ""}
                usedFrame={hostParticipant?.usedFrame}
                alt={getDisplayName(hostParticipant)}
              />
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {getDisplayName(hostParticipant)}
                  </span>
                  <FaCrown className="text-yellow-500" size={14} />
                  <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-2 py-0.5 rounded-full ml-1">
                    Host
                  </span>
                  {hostParticipant.userId === currentUserId && (
                    <span className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 px-2 py-0.5 rounded-full ml-1">
                      You
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Other participants */}
          {participants
            .filter(p => p.userId !== room.hostUserId)
            .map(participant => (
              <div 
                key={`participant-${participant.id}`}
                className={`flex items-center gap-2 p-2 rounded-lg ${
                  participant.userId === currentUserId 
                    ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Avatar
                  width="w-8"
                  height="h-8"
                  avatarUrl={participant.user?.avatarUrl || defaultAvatar}
                  usedFrame={participant.user?.usedFrame}
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
                    Joined {formatDistanceToNow(new Date(participant.joinedAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
            
          {participants.length <= 1 && (
            <div className="text-center py-2 text-gray-500 dark:text-gray-400 text-sm">
              No other participants yet. Share the room code to invite friends!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WatchPartyParticipants;