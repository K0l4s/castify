import React, { useEffect, useState, useRef, useCallback } from "react";
import { getUserActivities, removeUserActivity, removeAllUserActivities } from "../../../services/UserActivityService";
import CustomButton from "../../../components/UI/custom/CustomButton";
import { FiLoader } from "react-icons/fi";
import PodcastHistory from "../../../components/UI/podcast/PodcastHistory";
import { useToast } from "../../../context/ToastProvider";
import { FaRegTrashCan } from "react-icons/fa6";
// import { IoCloseOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import ConfirmModal from "../../../components/modals/utils/ConfirmDelete";
import { useLanguage } from "../../../context/LanguageContext";

const HistoryPage: React.FC = () => {
  const {language} = useLanguage();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  // const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearching, ] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  // Refs for infinite scrolling
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const toast = useToast();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const fetchActivities = async (pageNum: number) => {
    try {
      if (pageNum === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const data = await getUserActivities(pageNum);
      
      // Group activities by date
      let groupedActivities: any[] = [];
      if (pageNum === 0) {
        // For first page, create new groups
        if (data.content.length > 0) {
          const groups = groupActivitiesByDate(data.content);
          groupedActivities = groups;
        }
      } else {
        // For subsequent pages, merge with existing groups
        const newGroups = groupActivitiesByDate(data.content);
        groupedActivities = mergeActivityGroups(activities, newGroups);
      }
      
      setActivities(groupedActivities);
      setTotalPages(data.totalPages);
      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to fetch history');
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Group activities by date
  const groupActivitiesByDate = (activities: any[]) => {
    const groups: any[] = [];
    const dateMap = new Map<string, any[]>();
    
    activities.forEach(activity => {
      const date = new Date(activity.timestamp).toLocaleDateString();
      if (!dateMap.has(date)) {
        dateMap.set(date, []);
      }
      dateMap.get(date)?.push(activity);
    });
    
    dateMap.forEach((activities, date) => {
      groups.push({ date, activities });
    });
    
    return groups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };
  
  // Merge activity groups while maintaining date order
  const mergeActivityGroups = (existingGroups: any[], newGroups: any[]) => {
    const dateMap = new Map<string, any[]>();
    
    // Add existing groups to map
    existingGroups.forEach(group => {
      dateMap.set(group.date, group.activities);
    });
    
    // Merge new groups
    newGroups.forEach(group => {
      if (dateMap.has(group.date)) {
        // Merge activities for same date
        const existing = dateMap.get(group.date) || [];
        const newActivities = group.activities.filter((newAct: any) => 
          !existing.some((existAct: any) => existAct.id === newAct.id)
        );
        dateMap.set(group.date, [...existing, ...newActivities]);
      } else {
        dateMap.set(group.date, group.activities);
      }
    });
    
    // Convert map back to array
    const merged: any[] = [];
    dateMap.forEach((activities, date) => {
      merged.push({ date, activities });
    });
    
    return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Load more activities callback for infinite scrolling
  const loadMoreActivities = useCallback(() => {
    if (!loadingMore && page < totalPages - 1 && !isSearching) {
      setPage(prevPage => prevPage + 1);
    }
  }, [loadingMore, page, totalPages, isSearching]);

  useEffect(() => {
    if (isAuthenticated && !isSearching) {
      fetchActivities(page);
    } else if (!isAuthenticated) {
      setLoading(false);
    }
  }, [page, isAuthenticated, isSearching]);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loadingMore && page < totalPages - 1 && !isSearching) {
          loadMoreActivities();
        }
      },
      { threshold: 0.5 }
    );
    
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreActivities, loadingMore, page, totalPages, isSearching]);

  // const searchActivities = async () => {
  //   if (!searchTerm.trim()) {
  //     clearSearch();
  //     return;
  //   }
    
  //   setLoading(true);
  //   setIsSearching(true);
    
  //   try {
  //     const data = await searchUserActivities(searchTerm);
  //     const groups = groupActivitiesByDate(data);
  //     setActivities(groups);
  //   } catch (error) {
  //     console.error('Error searching activities:', error);
  //     setError('Failed to search activities');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (event.key === 'Enter') {
  //     searchActivities();
  //   }
  // };

  // const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setSearchTerm(event.target.value);
  // };

  // const clearSearch = () => {
  //   setSearchTerm("");
  //   setIsSearching(false);
  //   setPage(0);
  //   setActivities([]);
  // };

  const openConfirmModal = () => {
    setIsConfirmModalOpen(true);
  };

  const clearHistory = async () => {
    try {
      await removeAllUserActivities();
      setActivities([]);
      setTotalPages(0);
      toast.success("Removed all history successfully");
      setIsConfirmModalOpen(false);
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error("Failed to clear history");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeUserActivity(id);
      
      // Update the activities state by removing the deleted activity
      setActivities(prevGroups => {
        const updatedGroups = prevGroups.map(group => ({
          ...group,
          activities: group.activities.filter((activity: any) => activity.id !== id)
        }));
        
        // Remove any groups that no longer have activities
        return updatedGroups.filter(group => group.activities.length > 0);
      });
      
      toast.success("Removed from history");
    } catch (error) {
      console.error('Error removing activity:', error);
      toast.error("Failed to remove from history");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 py-12">
        <img 
          src="https://cdn-icons-png.flaticon.com/512/1698/1698535.png" 
          alt="Login Required" 
          className="w-32 h-32 mb-6 opacity-60"
        />
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3">Login Required</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md text-lg">
          Please login to see your viewing history
        </p>
      </div>
    );
  }

  if (loading && page === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <FiLoader size={48} className="text-blue-500 animate-spin"/>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex flex-col lg:flex-row rounded-lg">
      <div className="w-full lg:w-1/4 lg:pl-4 mb-6 lg:mb-0 order-first lg:order-last">
        <div className="rounded-lg p-3 md:p-4 mb-4 bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg md:text-xl text-black dark:text-white font-semibold mb-2">{language.history.searchHistory}</h2>
          {/* <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleSearch}
              className="w-full p-2 text-black dark:text-white text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Search by podcast title"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
              >
                <IoCloseOutline size={20} className="md:w-6 md:h-6" />
              </button>
            )}
          </div> */}
          <CustomButton
            text={language.history.clearAllHistory}
            icon={<FaRegTrashCan className="w-4 h-4 md:w-5 md:h-5" />}
            variant="ghost"
            onClick={openConfirmModal}
            className="mt-2 w-full text-sm md:text-base text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
          />
          {/* <CustomButton
            text="Manage your comment"
            icon={<FiSettings className="w-4 h-4 md:w-5 md:h-5" />}
            variant="ghost"
            className="mt-2 w-full text-sm md:text-base text-gray-700 dark:text-gray-300"
          /> */}
        </div>
      </div>
      <div className="w-full lg:w-3/4 lg:pr-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-black dark:text-white">{language.history.title}</h1>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png" 
              alt="No history" 
              className="w-32 h-32 mb-6 opacity-60"
            />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
              No viewing history found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
              {isSearching 
                ? "No podcasts match your search" 
                : "You haven't watched any podcasts yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {activities.map((group) => (
              <div key={group.date}>
                <h2 className="text-xl font-semibold mb-4 text-black dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  {group.date}
                </h2>
                <div className="space-y-4">
                  {group.activities.map((activity: any) => (
                    <PodcastHistory
                      key={activity.id}
                      podcast={activity.podcast}
                      onDelete={() => handleDelete(activity.id)}
                      timestamp={activity.timestamp}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Infinite scroll loading indicator */}
        <div ref={loadMoreRef} className="h-24 flex items-center justify-center mt-6">
          {loadingMore && (
            <div className="flex items-center justify-center">
              <FiLoader size={30} className="text-blue-500 animate-spin mr-3" />
              <span className="text-gray-600 dark:text-gray-300">Loading more...</span>
            </div>
          )}
          
          {!loadingMore && page >= totalPages - 1 && activities.length > 0 && !isSearching && (
            <div className="text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
              You've reached the end of your history
            </div>
          )}
        </div>
      </div>
      
      {/* Confirm Clear History Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title={`${language.history.clearAllHistory}?`}
        onConfirm={clearHistory}
        onClose={() => setIsConfirmModalOpen(false)}
      />
    </div>
  );
};

export default HistoryPage;