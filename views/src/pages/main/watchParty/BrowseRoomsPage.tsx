import React, { useRef, useState } from 'react';
import { FiUsers, FiGlobe, FiHome, FiLogIn } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import WatchPartyService from '../../../services/WatchPartyService';
import { WatchPartyRoom } from '../../../models/WatchPartyModel';
import { useToast } from '../../../context/ToastProvider';
import CustomButton from '../../../components/UI/custom/CustomButton';
import RoomSettingsModal from '../../../components/modals/watchParty/RoomSettingModal';
import { RootState } from '../../../redux/store';
import RoomSection from '../../../components/modals/watchParty/RoomSection';
import JoinRoomModal from '../../../components/modals/watchParty/JoinRoomModal';

const BrowseRoomsPage: React.FC = () => {
  const [joining, setJoining] = useState<string | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<WatchPartyRoom | null>(null);
  const [joinModalOpen, setJoinModalOpen] = useState<boolean>(false);

  const navigate = useNavigate();
  const toast = useToast();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const myRoomsRef = useRef<any>(null);
  const publicRoomsRef = useRef<any>(null);

  // Join room
  const handleJoinRoom = async (roomCode: string) => {
    try {
      setJoining(roomCode);
      const room = await WatchPartyService.joinRoom(roomCode);
      navigate(`/watch-party?room=${roomCode}&pid=${room.podcastId}`);
      toast.success('Joined room successfully!');
    } catch (error: any) {
      console.error('Error joining room:', error);
      toast.error(error.response?.data?.message || 'Failed to join room');
    } finally {
      setJoining(null);
    }
  };

  // Join room from modal
  const handleJoinRoomFromModal = async (roomCode: string): Promise<WatchPartyRoom | null> => {
    try {
      const room = await WatchPartyService.joinRoom(roomCode);
      setJoinModalOpen(false);
      navigate(`/watch-party?room=${roomCode}&pid=${room.podcastId}`);
      toast.success('Joined room successfully!');
      return room;
    } catch (error: any) {
      console.error('Error joining room:', error);
      toast.error(error.response?.data?.message || 'Failed to join room');
      throw error;
    }
  };

  // Handle settings click
  const handleSettingsClick = (room: WatchPartyRoom) => {
    setSelectedRoom(room);
    setSettingsModalOpen(true);
  };

  // Handle room update
  const handleRoomUpdate = (updatedRoom: WatchPartyRoom) => {
    setSelectedRoom(updatedRoom);
    if (myRoomsRef.current) {
      myRoomsRef.current.refreshRooms();
    }
    toast.success('Room updated successfully');
  };

  // Handle delete room
  const handleDeleteRoom = async () => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      // handle delete room
      toast.success('Room deleted successfully');
      // Refresh rooms list
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Failed to delete room');
    }
  };

  // Load functions for each section
  const loadMyRooms = (page: number, size: number) => {
    return WatchPartyService.getMyRooms(page, size);
  };

  const loadPublicRooms = (page: number, size: number) => {
    return WatchPartyService.getPublicRooms(page, size, true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <FiUsers className="text-2xl text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Watch Party Rooms
              </h1>
            </div>
            <CustomButton
              text="Join Room"
              icon={<FiLogIn />}
              variant="primary"
              onClick={() => setJoinModalOpen(true)}
            />
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Join public watch parties and discover new podcasts with others, or manage your own rooms
          </p>
        </div>

        {/* My Rooms Section */}
        <RoomSection
          title="My Rooms"
          ref={myRoomsRef}
          icon={<FiHome className="text-xl text-purple-600 dark:text-purple-400" />}
          loadRooms={loadMyRooms}
          isMyRooms={true}
          onJoinRoom={handleJoinRoom}
          onSettingsClick={handleSettingsClick}
          onDeleteRoom={handleDeleteRoom}
          joining={joining}
          currentUserId={currentUser?.id}
        />

        {/* Public Rooms Section */}
        <RoomSection
          title="Public Rooms"
          ref={publicRoomsRef}
          icon={<FiGlobe className="text-xl text-green-600 dark:text-green-400" />}
          loadRooms={loadPublicRooms}
          isMyRooms={false}
          onJoinRoom={handleJoinRoom}
          joining={joining}
          currentUserId={currentUser?.id}
        />

        {/* Join Room Modal */}
        <JoinRoomModal
          isOpen={joinModalOpen}
          onClose={() => setJoinModalOpen(false)}
          onSubmit={handleJoinRoomFromModal}
        />

        {/* Settings Modal */}
        {selectedRoom && (
          <RoomSettingsModal
            isOpen={settingsModalOpen}
            onClose={() => {
              setSettingsModalOpen(false);
              setSelectedRoom(null);
            }}
            room={selectedRoom}
            onRoomUpdate={handleRoomUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default BrowseRoomsPage;