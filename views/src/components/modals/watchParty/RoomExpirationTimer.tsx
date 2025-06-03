import React, { useState, useEffect, useCallback } from 'react';
import { FiClock, FiAlertTriangle } from 'react-icons/fi';
import CustomButton from '../../UI/custom/CustomButton';
import WatchPartyService from '../../../services/WatchPartyService';

interface RoomExpirationTimerProps {
  roomId: string;
  isHost: boolean;
  onExtend?: () => void;
}

const RoomExpirationTimer: React.FC<RoomExpirationTimerProps> = ({
  roomId,
  isHost,
  onExtend
}) => {
  const [expirationInfo, setExpirationInfo] = useState<{
    minutesRemaining: number;
    isExpiringSoon: boolean;
    expiresAt: string;
    canExtend: boolean;
  } | null>(null);
  const [extending, setExtending] = useState(false);

  // Fetch expiration info function
  const fetchExpirationInfo = useCallback(async () => {
    try {
      const data = await WatchPartyService.getRoomExpirationInfo(roomId);
      setExpirationInfo(data);
    } catch (error) {
      console.error('Failed to fetch expiration info:', error);
    }
  }, [roomId]);

  // Handle real-time expiration updates
  useEffect(() => {
    const expirationUpdateListener = (data: any) => {
      console.log('Expiration timer received update:', data);
      
      if (data.roomId === roomId) {
        // Calculate new minutes remaining
        const now = new Date();
        const newExpiresAt = new Date(data.newExpiresAt);
        const minutesRemaining = Math.max(0, Math.floor((newExpiresAt.getTime() - now.getTime()) / (1000 * 60)));
        const isExpiringSoon = minutesRemaining <= 30;

        // Update state immediately
        setExpirationInfo(prev => prev ? {
          ...prev,
          expiresAt: data.newExpiresAt,
          minutesRemaining,
          isExpiringSoon
        } : null);

        console.log(`Timer updated: ${minutesRemaining} minutes remaining`);
      }
    };

    // Add listener for real-time updates
    WatchPartyService.addExpirationUpdateListener(expirationUpdateListener);

    return () => {
      WatchPartyService.removeExpirationUpdateListener(expirationUpdateListener);
    };
  }, [roomId]);

  // Initial fetch and periodic update (fallback)
  useEffect(() => {
    fetchExpirationInfo();
    
    // Update every minute as fallback (in case WebSocket fails)
    const interval = setInterval(fetchExpirationInfo, 60000);
    
    return () => clearInterval(interval);
  }, [fetchExpirationInfo]);

  const handleExtend = async () => {
    if (!onExtend) return;
    
    setExtending(true);
    try {
      await onExtend();
      // The WebSocket listener will handle the update automatically
    } catch (error) {
      console.error('Failed to extend room:', error);
      // Only refresh on error
      await fetchExpirationInfo();
    } finally {
      setExtending(false);
    }
  };

  if (!expirationInfo) return null;

  const { minutesRemaining, isExpiringSoon, canExtend } = expirationInfo;
  
  const formatTimeRemaining = (minutes: number) => {
    if (minutes <= 0) return "Expired";
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className={`p-3 rounded-lg border transition-colors duration-300 ${
      isExpiringSoon 
        ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700' 
        : 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isExpiringSoon ? (
            <FiAlertTriangle className="text-yellow-600 dark:text-yellow-400" size={16} />
          ) : (
            <FiClock className="text-blue-600 dark:text-blue-400" size={16} />
          )}
          <span className={`text-sm font-medium transition-colors duration-300 ${
            isExpiringSoon 
              ? 'text-yellow-800 dark:text-yellow-300' 
              : 'text-blue-800 dark:text-blue-300'
          }`}>
            Room expires in: <span className="font-mono">{formatTimeRemaining(minutesRemaining)}</span>
          </span>
        </div>
        
        {isHost && canExtend && isExpiringSoon && (
          <CustomButton
            text={extending ? "Extending..." : "Extend"}
            size="sm"
            variant="outline"
            onClick={handleExtend}
            disabled={extending}
          />
        )}
      </div>
      
      {isExpiringSoon && (
        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
          ⚠️ Room will be closed about 5 minutes after time expires
        </p>
      )}
    </div>
  );
};

export default RoomExpirationTimer;