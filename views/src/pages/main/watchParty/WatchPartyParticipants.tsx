import React, { useRef, useState } from 'react';
import { WatchPartyRoom } from '../../../models/WatchPartyModel';
import { FiFlag, FiUserX, FiSettings, FiChevronDown } from 'react-icons/fi';
import { useClickOutside } from '../../../hooks/useClickOutside';
import HostItem from '../../../components/modals/watchParty/HostItem';
import ParticipantItem from '../../../components/modals/watchParty/ParticipantItem';
import RoomSettingsModal from '../../../components/modals/watchParty/RoomSettingModal';
import { ReportType } from '../../../models/Report';
import ReportModal from '../../../components/modals/report/ReportModal';
import KickBanUserModal from '../../../components/modals/watchParty/KickBanUserModal';
import { FaUsers } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';

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
}) => {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    userId: string;
    username: string;
    isOwnProfile: boolean;
    avatarUrl?: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    userId: '',
    username: '',
    isOwnProfile: false,
    avatarUrl: undefined
  });

  // Add settings modal state
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  const [reportModal, setReportModal] = useState<{
    isOpen: boolean;
    userId: string;
  }>({
    isOpen: false,
    userId: ''
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

  // Safe getter for display name
  const getDisplayName = (participant: any) => {
    if (!participant) return 'Unknown';
    const name = participant.username || participant.fullName || 'Unknown';
    return name.length > 15 ? name.slice(0, 15) + '…' : name;
  };

  // Safe check for participants array
  const participants = room.participants || [];
  
  // Find host participant
  const hostParticipant = participants.find(p => p.userId === room.hostUserId);
  
  useClickOutside(contextMenuRef, () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  });

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

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
      isOwnProfile,
      avatarUrl: participant.avatarUrl
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

  const handleKickBanConfirm = async (reason: string) => {
    setKickBanModal(prev => ({ ...prev, loading: true }));
    
    try {
      if (kickBanModal.type === 'kick' && onKickUser) {
        await onKickUser(kickBanModal.userId, reason);
      } else if (kickBanModal.type === 'ban' && onBanUser) {
        await onBanUser(kickBanModal.userId, reason);
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

  const handleReport = () => {
    setReportModal({
      isOpen: true,
      userId: contextMenu.userId
    });
    setContextMenu(prev => ({ ...prev, visible: false }));
  };
  
  const handleReportClose = () => {
    setReportModal({
      isOpen: false,
      userId: ''
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Clickable Header */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {/* Clickable title area */}
          <button
            onClick={toggleExpanded}
            className="flex-1 flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaUsers size={16} />
              {language.watchParty.participant.header} ({participants.length})
              <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                <FiChevronDown size={16} />
              </span>
            </h3>
          </button>
          
          {/* Settings button - separate from clickable area */}
          {isHost && (
            <div className="p-3">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering expand
                  setIsSettingsModalOpen(true);
                }}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Room Settings"
              >
                <FiSettings size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Collapsible Participants List with smooth animation */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded 
            ? 'max-h-[300px] opacity-100' 
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-2 max-h-[300px] overflow-y-auto">
          <div className="space-y-2">
            {/* Host first */}
            {hostParticipant && (
              <HostItem
                key={`host-${hostParticipant.id}`}
                hostParticipant={hostParticipant}
                currentUserId={currentUserId}
                onMenuClick={handleMenuClick}
                getDisplayName={getDisplayName}
              />
            )}
            
            {/* Other participants*/}
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
              <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                {language.watchParty.participant.note}
              </div>
            )}
          </div>
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
            {language.watchParty.participant.reportUser}
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
                {language.watchParty.participant.kickUser}
              </button>
              <button
                onClick={handleBan}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <FiUserX size={14} />
                {language.watchParty.participant.banUser}
              </button>
            </>
          )}
        </div>
      )}

      {/* Room Settings Modal */}
      <RoomSettingsModal
        isOpen={isSettingsModalOpen}
        isHost={isHost}
        onClose={() => setIsSettingsModalOpen(false)}
        room={room}
      />

      {/* Kick/Ban User Modal */}
      <KickBanUserModal
        isOpen={kickBanModal.isOpen}
        onClose={handleKickBanClose}
        onConfirm={handleKickBanConfirm}
        type={kickBanModal.type}
        username={kickBanModal.username}
        avatarUrl={kickBanModal.avatarUrl}
        loading={kickBanModal.loading}
      />

      {/* Report User Modal */}
      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={handleReportClose}
        targetId={reportModal.userId}
        reportType={ReportType.U}
      />
    </div>
  );
};

export default WatchPartyParticipants;