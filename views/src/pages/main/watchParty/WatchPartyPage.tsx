import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Podcast } from '../../../models/PodcastModel';
import { useToast } from '../../../context/ToastProvider';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import WatchPartyService from '../../../services/WatchPartyService';
import { ChatMessage, SyncEventType, WatchPartyRoom } from '../../../models/WatchPartyModel';
import { FiAlertCircle, FiLoader, FiSettings } from 'react-icons/fi';
import CustomButton from '../../../components/UI/custom/CustomButton';
import { FaCopy, FaDoorOpen, FaEye, FaPlus, FaSignInAlt, FaVideo } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '../../../context/LanguageContext';
import WatchPartyPlayer from './WatchPartyPlayer';
import WatchPartyParticipants from './WatchPartyParticipants';
import WatchPartyChat from './WatchPartyChat';
import CreateRoomModal from '../../../components/modals/watchParty/CreateRoomModal';
import JoinRoomModal from '../../../components/modals/watchParty/JoinRoomModal';
import { getPodcastById, likePodcast } from '../../../services/PodcastService';
import Avatar from '../../../components/UI/user/Avatar';
import CounterAnimation from '../../../components/UI/custom/animations/CounterAnimation';
import { formatViewsWithSeparators } from '../../../utils/formatViews';
import { HeartIcon } from '../../../components/UI/custom/SVG_Icon';
import defaultAvatar from '../../../assets/images/default_avatar.jpg';
import { userService } from '../../../services/UserService';
import KickBanModal from './KickBanModal';
import Cookie from 'js-cookie';
import { BaseApi } from '../../../utils/axiosInstance';
import ChangePodcastModal from '../../../components/modals/watchParty/ChangePodcastModal';
import RoomExpirationTimer from '../../../components/modals/watchParty/RoomExpirationTimer';
import RoomSettingsModal from '../../../components/modals/watchParty/RoomSettingModal';

const WatchPartyPage: React.FC = () => {
  const { language } = useLanguage();
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
  const [showRoomSettings, setShowRoomSettings] = useState<boolean>(false);
  const [kickBanNotification, setKickBanNotification] = useState<{
    visible: boolean;
    type: 'kick' | 'ban';
    reason: string;
    kickedBy: string;
  }>({
    visible: false,
    type: 'kick',
    reason: '',
    kickedBy: ''
  });

  const [roomClosedNotification, setRoomClosedNotification] = useState<{
    visible: boolean;
    roomName: string;
    closedBy: string;
    message: string;
  }>({
    visible: false,
    roomName: '',
    closedBy: '',
    message: ''
  });

  const [isChangePodcastModalOpen, setIsChangePodcastModalOpen] = useState<boolean>(false);

  // Add states for views and likes
  const [views, setViews] = useState<number>(0);
  const [totalLikes, setTotalLikes] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [follow, setFollow] = useState<boolean>(false);
  const [totalFollower, setTotalFollower] = useState<number>(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Add ref to track if user should auto-leave
  const shouldAutoLeaveRef = useRef<boolean>(true);
  // Add ref to track current room for cleanup
  const currentRoomRef = useRef<WatchPartyRoom | null>(null);

  // const { language } = useLanguage();
  const navigate = useNavigate();
  const toast = useToast();
  
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [isKickedOrBanned, setIsKickedOrBanned] = useState<boolean>(false);

  // Safely check if the current user is the host
  const isHost = room?.hostUserId === currentUser?.id;

  // Update room ref when room changes
  useEffect(() => {
    currentRoomRef.current = room;
  }, [room]);

  // Extend room handler
  const handleQuickExtendRoom = async () => {
    if (!room || !isHost) return;
    
    try {
      await WatchPartyService.extendRoom(room.id, 4);
      toast.success('Room time extended by 4 hours');
    } catch (error) {
      console.error('Failed to extend room:', error);
      toast.error('Failed to extend room time');
    }
  };

  // Auto-leave room functions
  const leaveRoomSilently = useCallback(async () => {
    const roomToLeave = currentRoomRef.current;
    if (!roomToLeave || !shouldAutoLeaveRef.current) return;
    
    const isCurrentUserHost = roomToLeave.hostUserId === currentUser?.id;
    if (isCurrentUserHost) {
      console.log(' Host detected - skipping auto-leave on route change');
      return;
    }

    try {
      // Disconnect WebSocket first
      WatchPartyService.disconnect();
      
      // Call leave room API
      await WatchPartyService.leaveRoom(roomToLeave.id);
      
      shouldAutoLeaveRef.current = false;
    } catch (error) {
      console.error('Error leaving room silently:', error);
    }
  }, [currentUser?.id]);

  // Use fetch with keepalive for reliable page unload
  const leaveRoomWithKeepalive = useCallback(() => {
    const roomToLeave = currentRoomRef.current;
    if (!roomToLeave || !shouldAutoLeaveRef.current) return;

    const isCurrentUserHost = roomToLeave.hostUserId === currentUser?.id;
    if (isCurrentUserHost) {
      console.log('Host detected - skipping auto-leave on page unload');
      return;
    }

    try {
      // Disconnect WebSocket immediately
      WatchPartyService.disconnect();
      
      // Use fetch with keepalive for reliable delivery
      const token = Cookie.get("token");
      
      fetch(`${BaseApi}/api/v1/watch-party/leave/${roomToLeave.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420'
        },
        body: JSON.stringify({}),
        keepalive: true
      }).then(() => {
        console.log('Leave room keepalive request sent');
        shouldAutoLeaveRef.current = false;
      }).catch(err => {
        console.error('Keepalive request failed:', err);
      });
      
    } catch (error) {
      console.error('Error in keepalive leave:', error);
    }
  }, [currentUser?.id]);

  // Handle page unload events (close tab, refresh, navigate away)
  useEffect(() => {
  const handlePageUnload = () => {
    if (currentRoomRef.current && shouldAutoLeaveRef.current) {
      // console.log(' Page unloading: Checking if should leave room...');
      leaveRoomWithKeepalive();
    }
  };

  // Use only pagehide - more reliable and no duplicates
  window.addEventListener('pagehide', handlePageUnload);

  return () => {
    window.removeEventListener('pagehide', handlePageUnload);
  };
}, [leaveRoomWithKeepalive]);
   // Component unmount cleanup (route change)
  useEffect(() => {
    return () => {
      if (shouldAutoLeaveRef.current && currentRoomRef.current) {
        // console.log(' Component unmounting, leaving room...');
        leaveRoomSilently();
      }
    };
  }, [leaveRoomSilently]);

  // Clean up WebSocket on unmount - separate effect
  useEffect(() => {
    return () => {
      WatchPartyService.disconnect();
    };
  }, []);

  // Fetch podcast data with refresh capability
  const fetchPodcastData = useCallback(async () => {
    if (podcastId && isAuthenticated) {
      try {
        const data = await getPodcastById(podcastId);
        setPodcast(data);
        setViews(data.views);
        setTotalLikes(data.totalLikes);
        setLiked(data.liked);
        setFollow(data.user.follow);
        setTotalFollower(data.user.totalFollower);
      } catch (error) {
        console.error("Failed to fetch podcast:", error);
        setError("Failed to load podcast");
      }
    }
  }, [podcastId, isAuthenticated]);

  // Fetch room details only for fallback in case WebSocket fails
  const fetchRoomDetails = useCallback(async (roomId: string) => {
    try {
      const roomDetails = await WatchPartyService.getRoomDetails(roomId);
      // console.log('Fetched updated room details (fallback):', roomDetails);
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
          setViews(data.views);
          setTotalLikes(data.totalLikes);
          setLiked(data.liked);
          setFollow(data.user.follow);
          setTotalFollower(data.user.totalFollower);
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

  // Add auto-refresh every 30 seconds like PodcastViewport
  useEffect(() => {
    // Start the refresh interval
    refreshIntervalRef.current = setInterval(() => {
      fetchPodcastData();
      console.log("Refreshing podcast data...");
    }, 30000); // 30 seconds

    // Clean up on component unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchPodcastData]);
  
  // Handle like functionality
  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.warning("Please login to like this podcast");
      return;
    }
    if (!podcast) return;
    
    try {
      await likePodcast(podcast.id);
      const updatedPodcast = await getPodcastById(podcast.id);
      setTotalLikes(updatedPodcast.totalLikes);
      setLiked(updatedPodcast.liked);
      setViews(updatedPodcast.views);
    } catch (error) {
      console.error("Error liking podcast:", error);
      toast.error("Failed to like podcast");
    }
  };

  // Handle follow functionality
  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.warning("Please login to follow this user");
      return;
    }
    if (!podcast) return;
    
    try {
      await userService.followUser(podcast.user.username);
      const updatedPodcast = await getPodcastById(podcast.id);
      setFollow(updatedPodcast.user.follow);
      setTotalFollower(updatedPodcast.user.totalFollower);
      setViews(updatedPodcast.views);
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Failed to follow user");
    }
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  // Callback to update views when incremented
  const handleViewIncrement = useCallback(() => {
    setViews(prevViews => prevViews + 1);
  }, []);

  // Function to open profile in new tab
  const openProfileInNewTab = (username: string) => {
    const url = `/profile/${username}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // WatchPartyChat
  const loadRoomMessages = useCallback(async (roomId: string) => {
    try {
      const messages = await WatchPartyService.getRoomMessages(roomId);
      setChatMessages(messages);
    } catch (error) {
      console.error('Failed to load room messages:', error);
    }
  }, []);

  useEffect(() => {
    if (room?.id && isConnected) {
      // Load messages when connected to room
      loadRoomMessages(room.id);
    }
  }, [room?.id, isConnected, loadRoomMessages]);

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
        console.error("Disconnected from watch party");
      }
    };
    
    const roomUpdateListener = (updatedRoom: WatchPartyRoom) => {
      // console.log('Room updated via WebSocket:', updatedRoom);
      setRoom(updatedRoom);
    };

    const roomClosedListener = (data: any) => {
      console.log('🏠🏠🏠 ROOM CLOSED LISTENER TRIGGERED:', data);
      
      setRoomClosedNotification({
        visible: true,
        roomName: data.roomName || 'Unknown Room',
        closedBy: data.closedBy || 'Unknown',
        message: data.message || 'Room has been closed'
      });
      
      // Disconnect and clear state immediately
      WatchPartyService.disconnect();
      setRoom(null);
      setChatMessages([]);
      setIsConnected(false);
      
      // Redirect after showing notification
      setTimeout(() => {
        setRoomClosedNotification(prev => ({ ...prev, visible: false }));
        navigate('/');
        toast.warning(data.message || 'Room has been closed');
      }, 5000);
    };

    const podcastChangedListener = (data: any) => {
      // Fetch the new podcast data
      const fetchNewPodcast = async () => {
        try {
          const newPodcastData = await getPodcastById(data.newPodcastId);
          setPodcast(newPodcastData);
          setViews(newPodcastData.views);
          setTotalLikes(newPodcastData.totalLikes);
          setLiked(newPodcastData.liked);
          setFollow(newPodcastData.user.follow);
          setTotalFollower(newPodcastData.user.totalFollower);
          
          // Update URL with new podcast ID
          navigate(`/watch-party?pid=${data.newPodcastId}&room=${room?.roomCode}`, { replace: true });
          
          toast.info(`Video changed to: ${data.newPodcastTitle}`);
        } catch (error) {
          console.error('Error fetching new podcast:', error);
          toast.error('Failed to load new video');
        }
      };

      fetchNewPodcast();
    };

    const settingsUpdateListener = (data: any) => {
      console.log('🔧 Room settings updated:', data);
    };

    const expirationUpdateListener = (data: any) => {
      if (data.roomId === room?.id) {
        // Update room expiration in room object
        setRoom(prevRoom => {
          if (!prevRoom) return prevRoom;
          return {
            ...prevRoom,
            expiresAt: data.newExpiresAt
          };
        });
      }
    };

    const syncEventListener = () => {
      // console.log('Received sync event:', event);
      // Handle any global sync event processing here if needed
    };

    const kickedListener = (data: any) => {
      
      if (data.targetUserId === currentUser?.id || data.targetUsername === currentUser?.username) {
        setIsKickedOrBanned(true);

        setKickBanNotification({
          visible: true,
          type: 'kick',
          reason: data.reason || 'No reason provided',
          kickedBy: data.kickedBy || 'Unknown'
        });
        
        // Disconnect and clear state
        WatchPartyService.disconnect();
        setRoom(null);
        setChatMessages([]);
        setIsConnected(false);

        setTimeout(() => {
          setKickBanNotification(prev => ({ ...prev, visible: false }));
          navigate('/');
          toast.warning(`You have been kicked from the watch party. Reason: ${data.reason || 'No reason provided'}`);
        }, 10000);
      } else {
        console.log(' This kick is not for me, ignoring...');
      }
    };


    const bannedListener = (data: any) => {
      
      // Check if this ban is for current user
      if (data.targetUserId === currentUser?.id || data.targetUsername === currentUser?.username) {
        setIsKickedOrBanned(true);

        setKickBanNotification({
          visible: true,
          type: 'ban',
          reason: data.reason || 'No reason provided',
          kickedBy: data.bannedBy || 'Unknown'
        });
        
        // Disconnect and clear state
        WatchPartyService.disconnect();
        setRoom(null);
        setChatMessages([]);
        setIsConnected(false);
      } else {
        console.log(' This ban is not for me, ignoring...');
      }
    };

    // Message deleted listener
    const messageDeletedListener = (data: any) => {
      setChatMessages(prev => prev.filter(msg => msg.id !== data.messageId));
    };

    WatchPartyService.addChatMessageListener(chatMessageListener);
    WatchPartyService.addConnectionStatusListener(connectionStatusListener);
    WatchPartyService.addRoomUpdateListener(roomUpdateListener);
    WatchPartyService.addSyncEventListener(syncEventListener);
    WatchPartyService.addKickedListener(kickedListener);
    WatchPartyService.addBannedListener(bannedListener);
    WatchPartyService.addMessageDeletedListener(messageDeletedListener);
    WatchPartyService.addSettingsUpdateListener(settingsUpdateListener);
    WatchPartyService.addRoomClosedListener(roomClosedListener);
    WatchPartyService.addPodcastChangedListener(podcastChangedListener);
    WatchPartyService.addExpirationUpdateListener(expirationUpdateListener);
    return () => {
      WatchPartyService.removeChatMessageListener(chatMessageListener);
      WatchPartyService.removeConnectionStatusListener(connectionStatusListener);
      WatchPartyService.removeRoomUpdateListener(roomUpdateListener);
      WatchPartyService.removeSyncEventListener(syncEventListener);
      WatchPartyService.removeKickedListener(kickedListener);
      WatchPartyService.removeBannedListener(bannedListener);
      WatchPartyService.removeMessageDeletedListener(messageDeletedListener);
      WatchPartyService.removeSettingsUpdateListener(settingsUpdateListener);
      WatchPartyService.removeRoomClosedListener(roomClosedListener);
      WatchPartyService.removePodcastChangedListener(podcastChangedListener);
      WatchPartyService.removeExpirationUpdateListener(expirationUpdateListener);
    };
  }, [toast, room?.id, currentUser]);

  const handleKickBanModalClose = () => {
    setKickBanNotification(prev => ({ ...prev, visible: false }));
    
    // Redirect to home page
    navigate('/');
    toast.warning(`You have been ${kickBanNotification.type === 'kick' ? 'kicked from' : 'banned from'} the watch party`);
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!room) return;
    
    try {
      await WatchPartyService.deleteMessage(room.id, messageId);
      // Remove message from local state immediately for better UX
      setChatMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success("Message deleted");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const handleRoomClosedModalClose = () => {
    setRoomClosedNotification(prev => ({ ...prev, visible: false }));
    navigate('/');
  };



  // Auto-join room from URL if room code is provided
  useEffect(() => {
    const joinRoomFromUrl = async () => {
      if (roomCode && isAuthenticated && !room && !isKickedOrBanned) {
        try {
          setLoading(true);
          setError(null);
          
          const joinedRoom = await WatchPartyService.joinRoom(roomCode);
          // console.log('Joined room data:', joinedRoom);
          setRoom(joinedRoom);
          
          // Connect to WebSocket
          await WatchPartyService.connect(joinedRoom.id);
          
            // Load existing messages after connecting
          await loadRoomMessages(joinedRoom.id);

          // If no podcast ID in URL, navigate to the room's podcast
          if (!podcastId) {
            navigate(`/watch-party?pid=${joinedRoom.podcastId}&room=${roomCode}`, { replace: true });
          }
          
          toast.success(`Joined room: ${joinedRoom.roomCode}`);
        } catch (error) {
          console.error("Failed to join room:", error);
          setError("Failed to join room. It may no longer exist.");
        } finally {
          setLoading(false);
        }
      }
    };

    joinRoomFromUrl();
  }, [roomCode, isAuthenticated, room, navigate, podcastId, toast, loadRoomMessages]);

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

  const handleCreateRoom = async (podcastId: string, roomName: string, publish: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      const newRoom = await WatchPartyService.createRoom({
        podcastId,
        roomName,
        publish
      });
      
      // console.log('Created room data:', newRoom);
      setRoom(newRoom);
      
      // Connect to WebSocket
      await WatchPartyService.connect(newRoom.id);
      
      // Load message (empty but good)
      await loadRoomMessages(newRoom.id);
    
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
      // console.log('Joined room data:', joinedRoom);
      setRoom(joinedRoom);
      
      // Connect to WebSocket
      await WatchPartyService.connect(joinedRoom.id);
      
      // Load existing messages
      await loadRoomMessages(joinedRoom.id);

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

  // Modified handleLeaveRoom to disable auto-leave
  const handleLeaveRoom = async () => {
    if (!room) return;
    
    try {
      setLoading(true);
      shouldAutoLeaveRef.current = false; // Disable auto-leave for manual leave
      
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
      shouldAutoLeaveRef.current = true; // Re-enable auto-leave on error
    } finally {
      setLoading(false);
    }
  };

  const handleSendChatMessage = (message: string) => {
    if (!room || !isConnected) return;
    WatchPartyService.sendChatMessage(room.id, message);
  };

  const handleKickUser = async (userId: string, reason?: string) => {
    if (!room) return;
    
    try {
      await WatchPartyService.kickUser(room.id, userId, reason);
      toast.success("User kicked successfully");
    } catch (error) {
      console.error("Error kicking user:", error);
      toast.error("Failed to kick user");
    }
  };

  const handleBanUser = async (userId: string, reason?: string) => {
    if (!room) return;
    
    try {
      await WatchPartyService.banUser(room.id, userId, reason);
      toast.success("User banned successfully");
    } catch (error) {
      console.error("Error banning user:", error);
      toast.error("Failed to ban user");
    }
  };

  const handleReportMessage = async () => {
    if (!room) return;
  };

  const handleReportUser = async () => {
    if (!room) return;
  };

  const handleSyncPlayback = (position: number, playing: boolean, eventType: SyncEventType) => {
    if (!room || !isConnected) return;
    // console.log('Sending sync event:', { position, playing, eventType });
    WatchPartyService.syncPlayback(room.id, position, playing, eventType);
  };

  const handleChangePodcast = async (newPodcastId: string) => {
    if (!room || !isHost) return;
    
    try {
      setLoading(true);
      
      await WatchPartyService.changePodcast(room.id, newPodcastId);
      
      setIsChangePodcastModalOpen(false);
      toast.success("Podcast changed successfully");
    } catch (error) {
      console.error("Failed to change podcast:", error);
      toast.error("Failed to change podcast");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChangePodcastModal = () => {
    if (!isHost) {
      toast.warning("Only the host can change the podcast");
      return;
    }
    
    setIsChangePodcastModalOpen(true);
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
    <div className="container mx-auto p-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language.watchParty.page.prefix}: {room?.roomName || 'Watch Party'}
          </h1>
        </div>

        {/* Add expiration timer and settings in header */}
        {room && (
          <div className="flex items-center gap-4">
            <RoomExpirationTimer
              roomId={room.id}
              isHost={isHost}
              onExtend={handleQuickExtendRoom}
            />
            {isHost && (
              <CustomButton
                text={language.watchParty.page.setting}
                icon={<FiSettings />}
                variant="outline"
                size="sm"
                onClick={() => setShowRoomSettings(true)}
              />
            )}
          </div>
        )}
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
              <span className="font-medium text-blue-800 dark:text-blue-300">{language.watchParty.page.roomCode}:</span>
              <span className="bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded text-blue-800 dark:text-blue-200 font-mono">
                {room.roomCode}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-sm text-gray-700 dark:text-gray-300">
              <div>
                <span className="font-medium">{language.watchParty.page.host}:</span> {getHostDisplayName()}
              </div>
              <div>
                <span className="font-medium">{language.watchParty.page.created}:</span> {formatDistanceToNow(new Date(room.createdAt || room.lastUpdated), { addSuffix: true })}
              </div>
              <div>
                <span className="font-medium">{language.watchParty.page.participants}:</span> {room.participants?.length || 0}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3 md:mt-0">
            <CustomButton
              text={language.watchParty.page.copyLink}
              icon={<FaCopy />}
              variant="outline"
              onClick={copyInviteLink}
            />
            <CustomButton
              text={language.watchParty.page.leaveRoom}
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
        <div className="lg:w-3/4">
          {podcast && room ? (
            <div>
              {/* Video Player */}
              <WatchPartyPlayer
                podcast={podcast}
                isHost={isHost}
                onSync={handleSyncPlayback}
                isConnected={isConnected}
                initialPosition={room.currentPosition || 0}
                roomId={room.id}
                onViewIncrement={handleViewIncrement}
                onChangePodcast={handleOpenChangePodcastModal}
              />

              {/* Podcast Info Section */}
                <div className="mt-4">
                  <h1 className="text-2xl font-bold mb-2 text-black dark:text-white">{podcast.title}</h1>
                  
                  {/* Creator Info & Actions */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        width='w-10'
                        height='h-10'
                        avatarUrl={podcast.user.avatarUrl || defaultAvatar}
                        usedFrame={podcast.user.usedFrame}
                        onClick={() => openProfileInNewTab(podcast.username)}
                      />
                      <div className="flex flex-col">
                        <span
                          className="text-base font-medium text-black dark:text-white cursor-pointer"
                          onClick={() => openProfileInNewTab(podcast.username)}>
                          {podcast.user.fullname}
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          <CounterAnimation value={totalFollower} /> {language.watchParty.page.follower}
                        </span>
                      </div>

                      {podcast.user.id !== currentUser?.id && (
                        <CustomButton
                          text={follow ? `${language.watchParty.page.unfollow}` : `${language.watchParty.page.follow}`}
                          variant="ghost"
                          rounded="full"
                          onClick={handleFollow}
                          className={`
                            ${!follow 
                              ? "bg-gray-800 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-800 hover:dark:bg-gray-400"
                              : "text-black bg-white border border-black hover:bg-gray-800 hover:text-white dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                            }
                          `}
                        />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Views */}
                      <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                        <FaEye size={16} />
                        <CounterAnimation
                          value={views}
                          formatter={formatViewsWithSeparators}
                        />
                      </div>

                      {/* Like button */}
                      <button 
                        onClick={handleLike}
                        className="flex items-center gap-1 px-3 py-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        title={liked ? language.watchParty.page.unlike : language.watchParty.page.like}
                      >
                        <HeartIcon 
                          filled={liked} 
                          color={liked ? "red" : "gray"} 
                          strokeColor={liked ? "red" : "gray"}
                        />
                        <span className="text-sm text-black dark:text-white">{totalLikes}</span>
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <div 
                      className={`text-black dark:text-white whitespace-pre-wrap ${isDescriptionExpanded ? '' : 'line-clamp-3'}`}
                      style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
                    >
                      {podcast.content}
                    </div>
                    {podcast.content && podcast.content.length > 150 && (
                      <button
                        onClick={toggleDescription}
                        className="text-blue-600 dark:text-blue-300 font-medium mt-2"
                      >
                        {isDescriptionExpanded ? language.watchParty.page.showLess : language.watchParty.page.showMore}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : podcast && !room ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
                  {language.watchParty.page.selectedPodcast}: {podcast.title}
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
                    text={language.watchParty.page.create}
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
                    {language.watchParty.page.fallback.text1}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                    {language.watchParty.page.fallback.text2}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <CustomButton
                      text={language.watchParty.page.browse}
                      variant="primary"
                      onClick={() => navigate('/')}
                    />
                    <CustomButton
                      text={language.watchParty.page.join}
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
          <div className="lg:w-1/4 flex flex-col gap-4">
            <WatchPartyParticipants 
              room={room} 
              currentUserId={currentUser?.id} 
              isHost={isHost}
              onKickUser={handleKickUser}
              onBanUser={handleBanUser}
              onReportUser={handleReportUser}
            />
            <WatchPartyChat 
              messages={chatMessages}
              isConnected={isConnected}
              isHost={isHost}
              currentUserId={currentUser?.id || ''}
              roomId={room?.id || ''}
              allowChat={room?.allowChat ?? true}
              onSendMessage={handleSendChatMessage}
              onKickUser={handleKickUser}
              onBanUser={handleBanUser}
              onReportMessage={handleReportMessage}
              onReportUser={handleReportUser}
              onDeleteMessage={handleDeleteMessage}
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

      {/* Kick/Ban Notification Modal */}
      <KickBanModal
        isVisible={kickBanNotification.visible}
        type={kickBanNotification.type}
        reason={kickBanNotification.reason}
        kickedBy={kickBanNotification.kickedBy}
        onClose={handleKickBanModalClose}
      />

      {/* Change Podcast Modal */}
      <ChangePodcastModal
        isOpen={isChangePodcastModalOpen}
        onClose={() => setIsChangePodcastModalOpen(false)}
        onConfirm={handleChangePodcast}
        currentPodcast={podcast}
      />

      {/* Room Closed Notification Modal */}
      {roomClosedNotification.visible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 border-2 border-red-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="text-red-500" size={24} />
                <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
                  {language.watchParty.page.closedModal.title}
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
                <p className="text-gray-900 dark:text-white mb-2">
                  <strong>{language.watchParty.page.closedModal.room}:</strong> {roomClosedNotification.roomName}
                </p>
                {roomClosedNotification.closedBy && (
                  <p className="text-gray-900 dark:text-white mb-2">
                    <strong>{language.watchParty.page.closedModal.closedBy}:</strong> {roomClosedNotification.closedBy}
                  </p>
                )}
                <p className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 p-3 rounded border italic">
                  "{roomClosedNotification.message}"
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <CustomButton
                text={language.watchParty.page.closedModal.returnHome}
                variant="primary"
                onClick={handleRoomClosedModalClose}
              />
            </div>
          </div>
        </div>
      )}

      {showRoomSettings && room && (
        <RoomSettingsModal
          isOpen={showRoomSettings}
          onClose={() => setShowRoomSettings(false)}
          room={room}
          isHost={isHost}
          onRoomUpdate={(updatedRoom) => {
            setRoom(updatedRoom);
            // setShowRoomSettings(false);
          }}
          onRoomClosed={() => {
            setRoom(null);
            setShowRoomSettings(false);
            navigate('/watch-party');
          }}
        />
      )}
    </div>
  );
};

export default WatchPartyPage;