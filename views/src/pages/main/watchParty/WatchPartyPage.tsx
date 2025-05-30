import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Podcast } from '../../../models/PodcastModel';
import { useToast } from '../../../context/ToastProvider';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import WatchPartyService from '../../../services/WatchPartyService';
import { ChatMessage, PlaybackSyncEvent, SyncEventType, WatchPartyRoom } from '../../../models/WatchPartyModel';
import { FiLoader } from 'react-icons/fi';
import CustomButton from '../../../components/UI/custom/CustomButton';
import { FaCopy, FaDoorOpen, FaPlus, FaSignInAlt, FaVideo } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
// import { useLanguage } from '../../../context/LanguageContext';
import WatchPartyPlayer from './WatchPartyPlayer';
import WatchPartyParticipants from './WatchPartyParticipants';
import WatchPartyChat from './WatchPartyChat';
import CreateRoomModal from '../../../components/modals/watchParty/CreateRoomModal';
import JoinRoomModal from '../../../components/modals/watchParty/JoinRoomModal';
import { getPodcastById } from '../../../services/PodcastService';

const WatchPartyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const podcastId = searchParams.get('pid');
  const roomCode = searchParams.get('room');

  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [room, setRoom] = useState<WatchPartyRoom | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  
  // const { language } = useLanguage();
  const navigate = useNavigate();
  const toast = useToast();
  
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  // Safely check if the current user is the host
  const isHost = room?.hostUserId === currentUser?.id;

  // Fetch room details only for fallback in case WebSocket fails
  const fetchRoomDetails = useCallback(async (roomId: string) => {
    try {
      const roomDetails = await WatchPartyService.getRoomDetails(roomId);
      console.log('Fetched updated room details (fallback):', roomDetails);
      setRoom(roomDetails);
    } catch (error) {
      console.error('Failed to fetch room details:', error);
    }
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning("Please login to access Watch Party");
      navigate('/login');
    }
  }, [isAuthenticated, navigate, toast]);

  // Fetch podcast if ID is provided
  useEffect(() => {
    const fetchPodcast = async () => {
      if (podcastId) {
        try {
          setLoading(true);
          const data = await getPodcastById(podcastId);
          setPodcast(data);
        } catch (error) {
          console.error("Failed to fetch podcast:", error);
          setError("Failed to load podcast");
        } finally {
          setLoading(false);
        }
      }
    };

    if (isAuthenticated) {
      fetchPodcast();
    }
  }, [podcastId, isAuthenticated]);

  // Setup WebSocket listeners
  useEffect(() => {
    const chatMessageListener = (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    };

    const connectionStatusListener = (status: boolean) => {
      setIsConnected(status);
      
      if (status) {
        toast.success("Connected to watch party");
        
        // Request sync once connected (more efficient than API call)
        if (room?.id) {
          WatchPartyService.requestRoomSync(room.id);
        }
      } else {
        toast.error("Disconnected from watch party");
      }
    };
    
    const roomUpdateListener = (updatedRoom: WatchPartyRoom) => {
      console.log('Room updated via WebSocket:', updatedRoom);
      setRoom(updatedRoom);
    };

    const syncEventListener = (event: PlaybackSyncEvent) => {
      console.log('Received sync event:', event);
      // Handle any global sync event processing here if needed
    };

    WatchPartyService.addChatMessageListener(chatMessageListener);
    WatchPartyService.addConnectionStatusListener(connectionStatusListener);
    WatchPartyService.addRoomUpdateListener(roomUpdateListener);
    WatchPartyService.addSyncEventListener(syncEventListener);

    return () => {
      WatchPartyService.removeChatMessageListener(chatMessageListener);
      WatchPartyService.removeConnectionStatusListener(connectionStatusListener);
      WatchPartyService.removeRoomUpdateListener(roomUpdateListener);
      WatchPartyService.removeSyncEventListener(syncEventListener);
    };
  }, [toast, room?.id]);

  // Auto-join room from URL if room code is provided
  useEffect(() => {
    const joinRoomFromUrl = async () => {
      if (roomCode && isAuthenticated && !room) {
        try {
          setLoading(true);
          setError(null);
          
          const joinedRoom = await WatchPartyService.joinRoom(roomCode);
          console.log('Joined room data:', joinedRoom);
          setRoom(joinedRoom);
          
          // Connect to WebSocket
          await WatchPartyService.connect(joinedRoom.id);
          
          // If no podcast ID in URL, navigate to the room's podcast
          if (!podcastId) {
            navigate(`/watch-party?pid=${joinedRoom.podcastId}&room=${roomCode}`, { replace: true });
          }
          
          toast.success(`Joined room: ${joinedRoom.roomName}`);
        } catch (error) {
          console.error("Failed to join room:", error);
          setError("Failed to join room. It may no longer exist.");
        } finally {
          setLoading(false);
        }
      }
    };

    joinRoomFromUrl();
  }, [roomCode, isAuthenticated, room, navigate, podcastId, toast]);

  // Only use a fallback refresh if WebSocket fails
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (room?.id && !isConnected) {
      // Only poll if WebSocket is disconnected as a fallback
      interval = setInterval(() => {
        console.log("WebSocket disconnected, using fallback API polling");
        fetchRoomDetails(room.id);
      }, 10000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [room?.id, isConnected, fetchRoomDetails]);

  // Clean up WebSocket connection on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        WatchPartyService.disconnect();
      }
    };
  }, [isConnected]);

  const handleCreateRoom = async (podcastId: string, roomName: string, isPublic: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      const newRoom = await WatchPartyService.createRoom({
        podcastId,
        roomName,
        isPublic
      });
      
      console.log('Created room data:', newRoom);
      setRoom(newRoom);
      
      // Connect to WebSocket
      await WatchPartyService.connect(newRoom.id);
      
      // Update URL with room code
      navigate(`/watch-party?pid=${podcastId}&room=${newRoom.roomCode}`, { replace: true });
      
      toast.success(`Created room: ${newRoom.roomName}`);
      return newRoom;
    } catch (error) {
      console.error("Failed to create room:", error);
      setError("Failed to create room");
      return null;
    } finally {
      setLoading(false);
      setIsCreateModalOpen(false);
    }
  };

  const handleJoinRoom = async (roomCode: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const joinedRoom = await WatchPartyService.joinRoom(roomCode);
      console.log('Joined room data:', joinedRoom);
      setRoom(joinedRoom);
      
      // Connect to WebSocket
      await WatchPartyService.connect(joinedRoom.id);
      
      // Navigate to the room with the podcast ID
      navigate(`/watch-party?pid=${joinedRoom.podcastId}&room=${roomCode}`, { replace: true });
      
      toast.success(`Joined room: ${joinedRoom.roomName}`);
      return joinedRoom;
    } catch (error) {
      console.error("Failed to join room:", error);
      setError("Failed to join room. It may no longer exist.");
      return null;
    } finally {
      setLoading(false);
      setIsJoinModalOpen(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (!room) return;
    
    try {
      setLoading(true);
      
      // Disconnect from WebSocket first
      WatchPartyService.disconnect();
      
      // Then leave the room via API
      await WatchPartyService.leaveRoom(room.id);
      
      // Clear room state
      setRoom(null);
      setChatMessages([]);
      
      // Remove room parameter from URL
      navigate(`/watch-party${podcastId ? `?pid=${podcastId}` : ''}`, { replace: true });
      
      toast.success("Left the watch party");
    } catch (error) {
      console.error("Failed to leave room:", error);
      toast.error("Failed to leave room");
    } finally {
      setLoading(false);
    }
  };

  const handleSendChatMessage = (message: string) => {
    if (!room || !isConnected) return;
    WatchPartyService.sendChatMessage(room.id, message);
  };

  const handleSyncPlayback = (position: number, playing: boolean, eventType: SyncEventType) => {
    if (!room || !isConnected) return;
    console.log('Sending sync event:', { position, playing, eventType });
    WatchPartyService.syncPlayback(room.id, position, playing, eventType);
  };

  const copyInviteLink = () => {
    if (!room) return;
    
    const url = `${window.location.origin}/watch-party?room=${room.roomCode}`;
    navigator.clipboard.writeText(url);
    toast.success("Invite link copied to clipboard");
  };

  // Function to safely get host display name
  const getHostDisplayName = () => {
    if (!room) return 'Unknown';
    
    // Find the host in participants
    const hostParticipant = room.participants?.find(p => p.userId === room.hostUserId);
    if (hostParticipant) {
      return hostParticipant.username || 'Unknown';
    }
    
    return 'Unknown Host';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <FiLoader size={48} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white mb-2">
          Watch Party {room ? `- ${room.roomName}` : ''}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Watch podcasts together with friends in real-time
        </p>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Room Info Banner (if in a room) */}
      {room && (
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-blue-800 dark:text-blue-300">Room Code:</span>
              <span className="bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded text-blue-800 dark:text-blue-200 font-mono">
                {room.roomCode}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-sm text-gray-700 dark:text-gray-300">
              <div>
                <span className="font-medium">Host:</span> {getHostDisplayName()}
              </div>
              <div>
                <span className="font-medium">Created:</span> {formatDistanceToNow(new Date(room.createdAt || room.lastUpdated), { addSuffix: true })}
              </div>
              <div>
                <span className="font-medium">Participants:</span> {room.participants?.length || 0}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3 md:mt-0">
            <CustomButton
              text="Copy Invite Link"
              icon={<FaCopy />}
              variant="outline"
              onClick={copyInviteLink}
            />
            <CustomButton
              text="Leave Room"
              icon={<FaDoorOpen />}
              variant="danger"
              onClick={handleLeaveRoom}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side - Video Player or Select Podcast */}
        <div className="lg:w-2/3">
          {podcast && room ? (
            <WatchPartyPlayer
              podcast={podcast}
              isHost={isHost}
              onSync={handleSyncPlayback}
              isConnected={isConnected}
              initialPosition={room.currentPosition || 0}
            />
          ) : podcast && !room ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
                Selected Podcast: {podcast.title}
              </h2>
              <img 
                src={podcast.thumbnailUrl || "/TEST.png"} 
                alt={podcast.title}
                className="w-full aspect-video object-cover rounded-lg mb-4"
              />
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {podcast.content?.length > 150 
                  ? `${podcast.content.substring(0, 150)}...` 
                  : podcast.content}
              </p>
              <div className="flex justify-center">
                <CustomButton
                  text="Create Watch Party"
                  icon={<FaPlus />}
                  variant="primary"
                  onClick={() => setIsCreateModalOpen(true)}
                />
              </div>
            </div>
          ) : !podcast && room ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-center items-center h-48">
                <FiLoader size={32} className="text-blue-500 animate-spin mr-3" />
                <span className="text-gray-700 dark:text-gray-300">Loading podcast...</span>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center text-center p-8">
                <FaVideo className="text-gray-400 dark:text-gray-600 mb-4" size={64} />
                <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
                  Start a Watch Party
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                  Select a podcast to watch or join an existing watch party room
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <CustomButton
                    text="Browse Podcasts"
                    variant="primary"
                    onClick={() => navigate('/')}
                  />
                  <CustomButton
                    text="Join Room"
                    icon={<FaSignInAlt />}
                    variant="secondary"
                    onClick={() => setIsJoinModalOpen(true)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Chat & Participants (only if in a room) */}
        {room && (
          <div className="lg:w-1/3 flex flex-col gap-4">
            <WatchPartyParticipants 
              room={room} 
              currentUserId={currentUser?.id} 
            />
            <WatchPartyChat 
              messages={chatMessages} 
              onSendMessage={handleSendChatMessage} 
              isConnected={isConnected} 
            />
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateRoom}
        podcast={podcast}
      />

      {/* Join Room Modal */}
      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSubmit={handleJoinRoom}
      />
    </div>
  );
};

export default WatchPartyPage;