import React, { useEffect, useRef, useState } from 'react';
import { Podcast } from '../../../models/PodcastModel';
import { SyncEventType } from '../../../models/WatchPartyModel';
import WatchPartyService from '../../../services/WatchPartyService';
import { formatTimeDuration, setupVideoViewTracking } from '../../../components/UI/podcast/video';
import { FaExchangeAlt, FaPause, FaPlay } from 'react-icons/fa';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';
import { BsFullscreen } from 'react-icons/bs';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { incrementPodcastViews } from '../../../services/PodcastService';

interface WatchPartyPlayerProps {
  podcast: Podcast;
  isHost: boolean;
  isConnected: boolean;
  initialPosition?: number;
  onSync: (position: number, playing: boolean, eventType: SyncEventType) => void;
  onChangePodcast?: () => void;
  roomId: string;
  onViewIncrement?: () => void;
}

const WatchPartyPlayer: React.FC<WatchPartyPlayerProps> = ({ 
  podcast, 
  isHost,
  isConnected,
  initialPosition = 0,
  onSync,
  onChangePodcast,
  roomId,
  onViewIncrement
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialPosition);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [, setIsSeeking] = useState(false);
  const [, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isReadyForSync, setIsReadyForSync] = useState(false);
  const [pendingPlayRequest, setPendingPlayRequest] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncTimeRef = useRef<number>(0);
  const syncThrottleRef = useRef<NodeJS.Timeout | null>(null);
  const initialSyncDoneRef = useRef<boolean>(false);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showHostLabels, setShowHostLabels] = useState(true);
  const hostLabelsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    // Add view tracking effect
  useEffect(() => {
    if (videoRef.current && isAuthenticated) {
      const cleanup = setupVideoViewTracking(
        videoRef.current,
        incrementPodcastViews,
        podcast.id,
        onViewIncrement
      );
      return cleanup;
    }
  }, [podcast.id, isAuthenticated]);

  useEffect(() => {
    const handleUserInteraction = () => {
      if (!hasUserInteracted) {
        setHasUserInteracted(true);
        
        // If there's a pending play request, try to fulfill it
        if (pendingPlayRequest && videoRef.current) {
          console.log('User interacted, attempting to play pending video');
          videoRef.current.play().then(() => {
            setPendingPlayRequest(false);
            setIsPlaying(true);
          }).catch(err => {
            console.error('Still cannot play video after user interaction:', err);
          });
        }
      }
    };

    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [hasUserInteracted, pendingPlayRequest]);

  // Helper function to safely play video
  const safePlayVideo = async () => {
    if (!videoRef.current) return false;

    try {
      await videoRef.current.play();
      setIsPlaying(true);
      setPendingPlayRequest(false);
      return true;
    } catch (err) {
      console.log('Cannot play video yet, waiting for user interaction:', err);
      setPendingPlayRequest(true);
      setIsPlaying(false);
      return false;
    }
  };

  // Thêm định kỳ cập nhật vị trí nếu là host
  useEffect(() => {
    if (isHost && isConnected && isReadyForSync && videoRef.current) {
      syncIntervalRef.current = setInterval(() => {
        if (videoRef.current && !videoRef.current.paused) {
          // console.log('Host sending periodic position update');
          onSync(
            videoRef.current.currentTime,
            true,
            SyncEventType.SEEK
          );
        }
      }, 5000);
    }
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [isHost, isConnected, isReadyForSync, onSync]);
  
  // Thêm xử lý cho host khi nhận được SYNC_REQUEST từ hệ thống
  useEffect(() => {
    const handleHostSyncRequest = () => {
      if (!isHost || !isConnected || !isReadyForSync || !videoRef.current) return;
      
      // console.log('Host received sync request, sending current position');
      
      // Gửi position hiện tại
      WatchPartyService.syncPlayback(
        roomId,
        videoRef.current.currentTime,
        !videoRef.current.paused,
        SyncEventType.SEEK
      );
    };
    
    WatchPartyService.addHostSyncRequestListener(handleHostSyncRequest);
    
    return () => {
      WatchPartyService.removeHostSyncRequestListener(handleHostSyncRequest);
    };
  }, [isHost, isConnected, isReadyForSync, roomId]);


  // Set initial position when video is loaded
  useEffect(() => {
    if (videoRef.current && initialPosition > 0 && !initialSyncDoneRef.current) {
      videoRef.current.currentTime = initialPosition;
      setCurrentTime(initialPosition);
      initialSyncDoneRef.current = true;
    }
  }, [initialPosition, isReadyForSync]);

  useEffect(() => {
    const handleSyncEvent = (event: any) => {
      if (!videoRef.current || !isReadyForSync) return;

      // Skip if we're the host and the event is not a sync request - we're controlling playback
      if (isHost && event.eventType !== SyncEventType.SYNC_REQUEST) {
        // console.log('Host ignoring sync event (expected behavior):', event);
        return;
      }
      
      // Skip if the sync is too close to our last one to avoid loops
      if (Date.now() - lastSyncTimeRef.current < 1000) {
        console.log('Ignoring too frequent sync event:', event);
        return;
      }

      // console.log('Processing sync event:', event);
      const { position, playing, eventType } = event;
      
      // Cập nhật thời gian phát với mọi loại event
      if (Math.abs(videoRef.current.currentTime - position) > 1) {
        console.log(`Adjusting position from ${videoRef.current.currentTime} to ${position}`);
        videoRef.current.currentTime = position;
        setCurrentTime(position);
      }
      
      switch(eventType) {
      case SyncEventType.PLAY:
        console.log('Sync: Playing video at position', position);
        // setIsPlaying(true);
        // Luôn gọi play() khi nhận được event PLAY
        safePlayVideo();
        // videoRef.current.play().catch(err => {
        //   console.error('Error playing video:', err);
        // });
        break;
        
      case SyncEventType.PAUSE:
        console.log('Sync: Pausing video at position', position);
        setIsPlaying(false);
        setPendingPlayRequest(false);
        videoRef.current.pause();
        break;
        
      case SyncEventType.SEEK:
        // Cũng áp dụng trạng thái phát/dừng khi nhận được SEEK
        if (playing && videoRef.current.paused) {
          console.log('Sync: Starting playback after seek');
          safePlayVideo();
          // videoRef.current.play().catch(err => {
          //   console.error('Error playing video after seek:', err);
          // });
          setIsPlaying(true);
        } else if (!playing && !videoRef.current.paused) {
          console.log('Sync: Pausing playback after seek');
          videoRef.current.pause();
          setIsPlaying(false);
          setPendingPlayRequest(false);
        }
        break;
        
      case SyncEventType.SYNC_REQUEST:
        if (isHost) {
          // Respond with current state
          console.log('Host responding to sync request');
          onSync(
            videoRef.current.currentTime,
            !videoRef.current.paused,
            SyncEventType.SEEK
          );
        }
        break;
    }
    };

    WatchPartyService.addSyncEventListener(handleSyncEvent);
    
    return () => {
      WatchPartyService.removeSyncEventListener(handleSyncEvent);
    };
  }, [isHost, isReadyForSync, onSync]);

  // Request sync from host when joining as participant
  useEffect(() => {
    if (!isHost && isConnected && isReadyForSync && videoRef.current) {
      console.log('Participant ready and requesting initial sync');
      
      // Đợi một chút để đảm bảo video đã load đầy đủ
      setTimeout(() => {
        console.log('Sending sync-request');
        WatchPartyService.requestRoomSync(roomId);
      }, 500);
    }
  }, [isHost, isConnected, isReadyForSync, roomId]);

  // Initialize video event listeners
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      setIsReadyForSync(true);
      
      // If we have an initial position, seek to it
      if (initialPosition > 0 && !initialSyncDoneRef.current) {
        console.log(`Setting initial position to ${initialPosition}`);
        videoElement.currentTime = initialPosition;
        setCurrentTime(initialPosition);
        initialSyncDoneRef.current = true;

        if (!isHost && isConnected) {
          console.log('Initialized position, requesting sync');
          WatchPartyService.requestRoomSync(roomId);
        }
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      
      // Only host should sync play events
      if (isHost && isConnected && isReadyForSync) {
        throttleSync(() => {
          console.log('Host syncing PLAY event');
          onSync(videoElement.currentTime, true, SyncEventType.PLAY);
        });
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
      
      // Only host should sync pause events
      if (isHost && isConnected && isReadyForSync) {
        throttleSync(() => {
          console.log('Host syncing PAUSE event');
          onSync(videoElement.currentTime, false, SyncEventType.PAUSE);
        });
      }
    };

    const handleSeeked = () => {
      // Only host should sync seek events
      if (isHost && isConnected && isReadyForSync) {
        throttleSync(() => {
          console.log('Host syncing SEEK event');
          onSync(videoElement.currentTime, !videoElement.paused, SyncEventType.SEEK);
        });
      }
    };

    // Add event listeners
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('seeked', handleSeeked);

    return () => {
      // Clean up event listeners
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('seeked', handleSeeked);
    };
  }, [isHost, isConnected, isReadyForSync, onSync, initialPosition]);

  // Set up controls & label auto-hide
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      setShowHostLabels(true);

      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      if (hostLabelsTimeoutRef.current) {
        clearTimeout(hostLabelsTimeoutRef.current);
      }
    
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);

      hostLabelsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowHostLabels(false);
        }
      }, 3000);
    };
    
    const playerContainer = playerContainerRef.current;
    if (playerContainer) {
      playerContainer.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      if (playerContainer) {
        playerContainer.removeEventListener('mousemove', handleMouseMove);
      }
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      if (hostLabelsTimeoutRef.current) {
        clearTimeout(hostLabelsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const throttleSync = (callback: () => void) => {
    lastSyncTimeRef.current = Date.now();
    
    if (syncThrottleRef.current) {
      clearTimeout(syncThrottleRef.current);
    }
    
    syncThrottleRef.current = setTimeout(() => {
      callback();
    }, 100); // Small delay to avoid rapid-fire events
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      safePlayVideo();
      // videoRef.current.play().catch(err => console.error('Error playing video:', err));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    
    if (isHost && isConnected && isReadyForSync) {
      throttleSync(() => {
        console.log('Host syncing SEEK from slider');
        onSync(newTime, isPlaying, SyncEventType.SEEK);
      });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
      videoRef.current.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      videoRef.current.muted = false;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    const newMutedState = !isMuted;
    videoRef.current.muted = newMutedState;
    setIsMuted(newMutedState);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (time: number) => {
    return formatTimeDuration(time);
  };

  const handleChangePodcast = () => {
    if (onChangePodcast) {
      onChangePodcast();
    }
  };

  return (
    <div 
      ref={playerContainerRef}
      className="relative bg-black rounded-lg overflow-hidden"
      data-testid="watch-party-player"
    >
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full aspect-video"
        src={podcast.videoUrl}
        poster={podcast.thumbnailUrl || undefined}
        playsInline
        onClick={isHost ? togglePlay : undefined}
        data-testid="video-element"
      />
      
      {/* Connection status indicator */}
      {/* <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium z-20 ${
        isConnected ? "bg-green-500" : "bg-red-500"
      } text-white`}>
        {isConnected ? "Connected" : "Disconnected"}
      </div> */}
      
      {/* Host indicator */}
      <div className={`absolute top-2 left-2 flex items-center gap-2 z-20 transition-opacity duration-300 ${
        showHostLabels ? 'opacity-100' : 'opacity-0'
      }`}>
        {isHost && (
          <div className="px-3 py-2 rounded-full text-sm font-medium bg-blue-500 text-white">
            Host
          </div>
        )}
        
        {isHost && onChangePodcast && (
          <button
            onClick={handleChangePodcast}
            className="px-2 py-2 rounded-full text-sm font-medium bg-purple-500 hover:bg-purple-600 text-white transition-colors flex items-center gap-1"
            title="Change Podcast"
          >
            <FaExchangeAlt size={10} />
            <span className="hidden sm:inline">Change source</span>
          </button>
        )}
      </div>
      
      {/* User interaction prompt for participants */}
      {!isHost && pendingPlayRequest && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center max-w-sm mx-4">
            <FaPlay className="mx-auto text-blue-500 mb-3" size={32} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Click to Start Watching
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your browser requires interaction to play video. Click anywhere to join the session.
            </p>
            <button
              onClick={() => safePlayVideo()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Start Watching
            </button>
          </div>
        </div>
      )}
      
      {/* Video Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress bar */}
        <div className="relative w-full h-1 bg-gray-600 rounded-full mb-3 cursor-pointer group">
          <input 
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onMouseDown={() => setIsSeeking(true)}
            onMouseUp={() => setIsSeeking(false)}
            disabled={!isHost}
            data-testid="progress-slider"
          />
          <div 
            className="absolute top-0 left-0 h-full bg-red-500 rounded-full"
            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
          ></div>
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {formatTime(currentTime)}
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={isHost ? togglePlay : undefined}
              className={`text-white transition-colors ${isHost ? 'hover:text-gray-300' : 'opacity-60'}`}
              disabled={!isHost}
              title={isHost ? (isPlaying ? "Pause" : "Play") : "Only the host can control playback"}
              data-testid="play-pause-button"
            >
              {isPlaying ? (
                <FaPause size={20} />
              ) : (
                <FaPlay size={20} />
              )}
            </button>
            
            <div className="text-white text-sm hidden md:block">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleMute}
                className="text-white hover:text-gray-300 transition-colors"
                data-testid="mute-button"
              >
                {isMuted ? (
                  <FiVolumeX size={20} />
                ) : (
                  <FiVolume2 size={20} />
                )}
              </button>
              
              <div className="w-20 hidden md:block">
                <input 
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-gray-600 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  data-testid="volume-slider"
                />
              </div>
            </div>
            
            <button 
              onClick={toggleFullscreen}
              className="text-white hover:text-gray-300 transition-colors"
              data-testid="fullscreen-button"
            >
              <BsFullscreen size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Playback state */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {isPlaying === false && (
          <div className="p-5 bg-black/50 rounded-full">
            <FaPlay size={30} className="text-white ml-1" />
          </div>
        )}
        
        {/* Non-host message */}
        {!isHost && (
          <div className={`absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-sm px-3 py-1 rounded transition-opacity ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}>
            Only the host can control playback
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchPartyPlayer;