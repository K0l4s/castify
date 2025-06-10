import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { FiUsers, FiRefreshCw } from 'react-icons/fi';
import RoomCard from './RoomCard';
import { WatchPartyRoom } from '../../../models/WatchPartyModel';
import { useToast } from '../../../context/ToastProvider';
import CustomButton from '../../UI/custom/CustomButton';
import { useLanguage } from '../../../context/LanguageContext';

interface RoomSectionProps {
  title: string;
  icon: React.ReactNode;
  loadRooms: (page: number, size: number) => Promise<{
    content: WatchPartyRoom[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
  }>;
  isMyRooms?: boolean;
  onJoinRoom: (roomCode: string) => void;
  onSettingsClick?: (room: WatchPartyRoom) => void;
  joining: string | null;
  currentUserId?: string;
}

export interface RoomSectionRef {
  refreshRooms: () => void;
}

const RoomSection = forwardRef<RoomSectionRef, RoomSectionProps>(({
  title,
  icon,
  loadRooms,
  isMyRooms = false,
  onJoinRoom,
  onSettingsClick,
  joining,
  currentUserId
}, ref) => {
  const {language} = useLanguage();
  const [rooms, setRooms] = useState<WatchPartyRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  
  const toast = useToast();
  const observerRef = useRef<HTMLDivElement>(null);

  // Load rooms function
  const loadRoomsData = useCallback(async (pageNum: number, append: boolean = false) => {
    if (loading) return;
    
    try {
      setLoading(true);
      const response = await loadRooms(pageNum, 12);
      
      if (append) {
        setRooms(prev => [...prev, ...response.content]);
      } else {
        setRooms(response.content);
      }
      
      setCurrentPage(response.currentPage);
      setHasMore(response.currentPage < response.totalPages - 1);
    } catch (error) {
      console.error(`Error loading ${title.toLowerCase()}:`, error);
      toast.error(`Failed to load ${title.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  }, [loading, loadRooms, title, toast]);

  const refreshRooms = useCallback(() => {
    setRooms([]);
    setCurrentPage(0);
    setHasMore(true);
    loadRoomsData(0, false);
  }, [loadRoomsData, title]);

  // Expose refresh function via ref
  useImperativeHandle(ref, () => ({
    refreshRooms
  }), [refreshRooms]);

  // Initial load
  useEffect(() => {
    loadRoomsData(0, false);
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadRoomsData(currentPage + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, currentPage, loadRoomsData]);

  // Refresh function
  // const handleRefresh = () => {
  //   setRooms([]);
  //   setCurrentPage(0);
  //   setHasMore(true);
  //   loadRoomsData(0, false);
  // };

  return (
    <div className="mb-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
        <CustomButton
          text={language.common.refresh}
          icon={<FiRefreshCw />}
          variant="outline"
          size="sm"
          onClick={refreshRooms}
          disabled={loading}
        />
      </div>

      {/* Rooms Grid */}
      {rooms.length === 0 && !loading ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <FiUsers className="mx-auto text-4xl text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-1">
            {language.watchParty.browse.noRoomAvailable}
          </h3>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            {language.watchParty.browse.noRoomAvailableDescription}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                isMyRoom={isMyRooms}
                isJoining={joining === room.roomCode}
                onJoinRoom={onJoinRoom}
                onSettingsClick={onSettingsClick}
                currentUserId={currentUserId}
              />
            ))}
          </div>

          {/* Loading Spinner */}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Intersection Observer Target */}
          {hasMore && rooms.length > 0 && (
            <div ref={observerRef} className="h-10 flex items-center justify-center">
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                Loading more rooms...
              </div>
            </div>
          )}

        </>
      )}
    </div>
  );
});

export default RoomSection;