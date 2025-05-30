import React, { useEffect, useRef, useState } from 'react';
import { Podcast } from '../../../models/PodcastModel';
import { SyncEventType } from '../../../models/WatchPartyModel';
import WatchPartyService from '../../../services/WatchPartyService';
import { formatTimeDuration } from '../../../components/UI/podcast/video';
import { FaPause, FaPlay } from 'react-icons/fa';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';
import { BsFullscreen } from 'react-icons/bs';

interface WatchPartyPlayerProps {
  podcast: Podcast;
  isHost: boolean;
  isConnected: boolean;
  initialPosition?: number;
  onSync: (position: number, playing: boolean, eventType: SyncEventType) => void;
}

const WatchPartyPlayer: React.FC<WatchPartyPlayerProps> = ({ 
  podcast, 
  isHost,
  isConnected,
  initialPosition = 0,
  onSync
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
  
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncTimeRef = useRef<number>(0);
  const syncThrottleRef = useRef<NodeJS.Timeout | null>(null);
  const initialSyncDoneRef = useRef<boolean>(false);

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
      console.log('Host ignoring sync event (expected behavior):', event);
      return;
    }
    
    // Skip if the sync is too close to our last one to avoid loops
    if (Date.now() - lastSyncTimeRef.current < 1000) {
      console.log('Ignoring too frequent sync event:', event);
      return;
    }

    console.log('Processing sync event:', event);
    const { position, playing, eventType } = event;
    
    switch(eventType) {
      case SyncEventType.PLAY:
        console.log('Sync: Playing video at position', position);
        setIsPlaying(true);
        videoRef.current.currentTime = position;
        videoRef.current.play().catch(err => console.error('Error playing video:', err));
        break;
        
      case SyncEventType.PAUSE:
        console.log('Sync: Pausing video at position', position);
        setIsPlaying(false);
        videoRef.current.currentTime = position;
        videoRef.current.pause();
        break;
        
      case SyncEventType.SEEK:
        // Always seek to the exact position during a SEEK event
        console.log(`Seeking from ${videoRef.current.currentTime} to ${position}`);
        videoRef.current.currentTime = position;
        setCurrentTime(position);
        
        // Also apply the play/pause state
        if (playing && videoRef.current.paused) {
          console.log('Sync: Starting playback after seek');
          videoRef.current.play().catch(err => console.error('Error playing video after seek:', err));
          setIsPlaying(true);
        } else if (!playing && !videoRef.current.paused) {
          console.log('Sync: Pausing playback after seek');
          videoRef.current.pause();
          setIsPlaying(false);
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
      console.log('Participant requesting initial sync');
      onSync(0, false, SyncEventType.SYNC_REQUEST);
    }
  }, [isHost, isConnected, isReadyForSync, onSync]);

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

  // Set up controls auto-hide
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
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
      videoRef.current.play().catch(err => console.error('Error playing video:', err));
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

  return (
    <div 
      ref={playerContainerRef}
      className="relative bg-black rounded-lg overflow-hidden"
      data-testid="watch-party-player"
    >
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full"
        src={podcast.videoUrl}
        poster={podcast.thumbnailUrl || undefined}
        playsInline
        onClick={isHost ? togglePlay : undefined}
        data-testid="video-element"
      />
      
      {/* Connection status indicator */}
      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium z-20 ${
        isConnected ? "bg-green-500" : "bg-red-500"
      } text-white`}>
        {isConnected ? "Connected" : "Disconnected"}
      </div>
      
      {/* Host indicator */}
      {isHost && (
        <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium z-20 bg-blue-500 text-white">
          Host
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