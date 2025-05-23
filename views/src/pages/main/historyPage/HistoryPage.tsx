import React, { useEffect, useState } from "react";
import { getUserActivities, removeUserActivity, removeAllUserActivities, searchUserActivities } from "../../../services/UserActivityService";
import CustomButton from "../../../components/UI/custom/CustomButton";
import { FiLoader, FiSettings } from "react-icons/fi";
import PodcastHistory from "../../../components/UI/podcast/PodcastHistory";
import { useToast } from "../../../context/ToastProvider";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoCloseOutline } from "react-icons/io5";

const History: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const toast = useToast();

  const fetchActivities = async (page: number) => {
    setLoading(true);
    try {
      const data = await getUserActivities(page);
      if (data.content.length === 0 && page === 0) {
        setHasMore(false);
      } else {
        setActivities(prevActivities => [
          ...prevActivities,
          { date: new Date(data.content[0]?.timestamp).toLocaleDateString(), activities: data.content }
        ]);
        setHasMore(data.content.length > 0 && (page + 1) < data.totalPages);
      }
    } catch (error) {
      setError('Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSearching) {
      fetchActivities(page);
    }
  }, [page, isSearching]);

  const loadMore = () => {
    if (!loading) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const searchActivities = async (title: string) => {
    setLoading(true);
    setIsSearching(true);
    try {
      const data = await searchUserActivities(title);
      setActivities(data);
      setHasMore(false);
    } catch (error) {
      setError('Failed to search activities');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      searchActivities(searchTerm);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setActivities([]);
    setIsSearching(false);
    setPage(0);
  };

  const clearHistory = async () => {
    try {
      await removeAllUserActivities();
      setActivities([]);
      setHasMore(false);
      toast.success("Remove activities successfully");
    } catch (error) {
      setError('Failed to clear history');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeUserActivity(id);
      setActivities(prevActivities => prevActivities.map(group => ({
        ...group,
        activities: group.activities.filter((activity: any) => activity.id !== id)
      })));
      toast.success("Remove activities successfully");
    } catch (error) {
      setError('Failed to delete activity');
    }
  };

  const filteredActivities = activities.flatMap(group =>
    group.activities.map((activity: any) => ({ ...activity, date: group.date }))
  );

  if (loading && page === 0) {
    return <div className="flex justify-center items-center h-screen"><FiLoader size={48} className="text-black dark:text-white animate-spin"/></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 flex flex-col lg:flex-row rounded-lg">
      <div className="w-full lg:w-1/4 lg:pl-4 mb-6 lg:mb-0 order-first lg:order-last">
        <div className="rounded-lg p-3 md:p-4 mb-4 bg-white/5 backdrop-blur-sm">
          <h2 className="text-lg md:text-xl text-black dark:text-white font-semibold mb-2">Search History</h2>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleSearch}
              className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Search by podcast title"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-2 text-gray-500 dark:text-gray-300"
              >
                <IoCloseOutline size={20} className="md:w-6 md:h-6" />
              </button>
            )}
          </div>
          <CustomButton
            text="Clear all viewed history"
            icon={<FaRegTrashCan className="w-4 h-4 md:w-5 md:h-5" />}
            variant="ghost"
            onClick={clearHistory}
            className="mt-2 w-full text-sm md:text-base text-gray-900 dark:text-white"
          />
          <CustomButton
            text="Manage your comment"
            icon={<FiSettings className="w-4 h-4 md:w-5 md:h-5" />}
            variant="ghost"
            className="mt-2 w-full text-sm md:text-base text-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="w-full lg:w-3/4 lg:pr-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-black dark:text-white">Viewed History</h1>
        {activities.length === 0 ? (
          <div className="text-center mt-4 text-gray-500 font-medium text-base md:text-lg">No history available</div>
        ) : (
          <div>
            {filteredActivities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                {(index === 0 || activity.date !== filteredActivities[index - 1].date) && (
                  <h2 className="text-xl md:text-2xl font-semibold mb-2 mt-6 md:mt-8 text-black dark:text-white">{activity.date}</h2>
                )}
                <ul className="space-y-3 md:space-y-4 my-3 md:my-4">
                  <li>
                    <PodcastHistory
                      podcast={activity.podcast}
                      onDelete={() => handleDelete(activity.id)}
                    />
                  </li>
                </ul>
              </React.Fragment>
            ))}
          </div>
        )}
        {hasMore && (
          <div className="flex justify-center mt-4">
            <CustomButton
              onClick={loadMore}
              className="bg-blue-500 text-white px-3 md:px-4 py-2 text-sm md:text-base rounded-lg hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </CustomButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;