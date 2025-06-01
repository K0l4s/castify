import React, { useState, useEffect } from 'react';
import { FiUserMinus, FiShield, FiSettings } from 'react-icons/fi';
import Avatar from '../../UI/user/Avatar';
import CustomButton from '../../UI/custom/CustomButton';
import CustomModal from '../../UI/custom/CustomModal';
import WatchPartyService from '../../../services/WatchPartyService';
import { useToast } from '../../../context/ToastProvider';
import defaultAvatar from "../../../assets/images/default_avatar.jpg";
import { FaCopy } from 'react-icons/fa';
import { WatchPartyRoom } from '../../../models/WatchPartyModel';

interface BannedUser {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  usedFrame?: any;
}

interface RoomSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: WatchPartyRoom;
}

interface SettingTab {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const settingTabs: SettingTab[] = [
  {
    id: 'general',
    name: 'General',
    icon: <FiSettings size={20} />,
    description: 'Room settings'
  },
    {
    id: 'banlist',
    name: 'Ban List',
    icon: <FiShield size={20} />,
    description: 'Manage banned users'
  },
  // {
  //   id: 'permissions',
  //   name: 'Permissions',
  //   icon: <FiUsers size={20} />,
  //   description: 'User permissions'
  // }
];

const RoomSettingsModal: React.FC<RoomSettingsModalProps> = ({
  isOpen,
  onClose,
  room
}) => {
  const [activeTab, setActiveTab] = useState<string>('general');
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [unbanning, setUnbanning] = useState<string | null>(null);
  const toast = useToast();

  const roomId = room.id; 
  const roomName = room.roomName; 
  const roomCode = room.roomCode;

  // Load banned users when modal opens
  useEffect(() => {
    if (isOpen && roomId && activeTab === 'banlist') {
      loadBannedUsers();
    }
  }, [isOpen, roomId, activeTab]);

  const loadBannedUsers = async () => {
    try {
      setLoading(true);
      const users = await WatchPartyService.getBannedUsers(roomId);
      setBannedUsers(users);
    } catch (error) {
      console.error('Error loading banned users:', error);
      toast.error('Failed to load banned users');
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async (userId: string, username: string) => {
    try {
      setUnbanning(userId);
      await WatchPartyService.unbanUser(roomId, userId);
      
      // Remove from local state
      setBannedUsers(prev => prev.filter(user => user.id !== userId));
      
      toast.success(`${username} has been unbanned`);
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast.error('Failed to unban user');
    } finally {
      setUnbanning(null);
    }
  };

  const getDisplayName = (user: BannedUser) => {
    return user.fullName || user.username || 'Unknown';
  };

  const renderBanListContent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Banned Users ({bannedUsers.length})
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage users who have been banned from this room
          </p>
        </div>
        <button
          onClick={loadBannedUsers}
          disabled={loading}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 transition-colors"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : bannedUsers.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <FiUserMinus size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No banned users</p>
          <p className="text-sm">Users who get banned will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {bannedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  width="w-12"
                  height="h-12"
                  avatarUrl={user.avatarUrl || defaultAvatar}
                  usedFrame={user.usedFrame}
                  alt={getDisplayName(user)}
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {getDisplayName(user)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    @{user.username}
                  </div>
                </div>
              </div>
              
              <CustomButton
                text={unbanning === user.id ? 'Unbanning...' : 'Unban'}
                variant="outline"
                size="sm"
                disabled={unbanning === user.id}
                onClick={() => handleUnban(user.id, user.username)}
                className="text-green-600 dark:text-green-400 border-green-600 dark:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderGeneralContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Room Information
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Basic room settings and information
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Room Name
          </label>
          <div className="text-gray-900 dark:text-white font-medium">
            {roomName}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Room Code
          </label>
          <div className="text-gray-900 dark:text-white font-mono">
            <CustomButton
              icon={<FaCopy size={16} />}
              text={roomCode}
              variant="outline"
              size="md"
              className="text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 hover:bg-blue-100 dark:hover:bg-blue-600/40"
              onClick={() => { 
                navigator.clipboard.writeText(roomCode)
                toast.success('Room code copied to clipboard');
              }} 
            />
          </div>
        </div>

        {/* Future settings can be added here */}
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FiSettings size={48} className="mx-auto mb-4 opacity-50" />
          <p>More general settings coming soon...</p>
        </div>
      </div>
    </div>
  );

  // Render Permissions Content
  // const renderPermissionsContent = () => (
  //   <div className="space-y-6">
  //     <div>
  //       <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
  //         User Permissions
  //       </h3>
  //       <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
  //         Control what participants can do in this room
  //       </p>
  //     </div>

  //     <div className="text-center py-12 text-gray-500 dark:text-gray-400">
  //       <FiUsers size={48} className="mx-auto mb-4 opacity-50" />
  //       <p className="text-lg font-medium">Permissions Settings</p>
  //       <p className="text-sm">Permission controls coming soon...</p>
  //     </div>
  //   </div>
  // );

  // Render Content Based on Active Tab
  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralContent();
      case 'banlist':
        return renderBanListContent();
      // case 'permissions':
      //   return renderPermissionsContent();
      default:
        return renderGeneralContent();
    }
  };

  return (
    <CustomModal
      title={`Room Settings`}
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      animation="zoom"
      className="backdrop-blur-sm"
    >
      <div className="flex min-h-[500px]">
        {/* Left Sidebar - Settings Navigation */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 pr-6">
          <div className="space-y-2">
            {settingTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className={`flex-shrink-0 ${
                  activeTab === tab.id 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {tab.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {tab.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {tab.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 pl-6">
          {renderContent()}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
        <CustomButton
          text="Close"
          variant="secondary"
          onClick={onClose}
        />
      </div>
    </CustomModal>
  );
};

export default RoomSettingsModal;