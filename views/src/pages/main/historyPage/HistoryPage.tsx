import React, { useEffect, useState } from "react";
import { getUserActivities } from "../../../services/UserActivityService";
import CustomButton from "../../../components/UI/custom/CustomButton";
import { FiLoader } from "react-icons/fi";
import PodcastHistory from "../../../components/UI/podcast/PodcastHistory";

const History: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchActivities = async (page: number) => {
    setLoading(true);
    try {
      const data = await getUserActivities(page);
      setActivities(prevActivities => [
        ...prevActivities,
        { date: new Date(data.content[0].timestamp).toLocaleDateString(), activities: data.content }
      ]);
      setHasMore(data.content.length > 0 && (page + 1) < data.totalPages);
    } catch (error) {
      setError('Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(page);
  }, [page]);

  const loadMore = () => {
    if (!loading) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const clearHistory = () => {
    // Implement clear history functionality here
    console.log("Clear history");
  };

  const handleDelete = (id: string) => {
    // Implement delete functionality here
    console.log("Delete podcast with id:", id);
  };

  const filteredActivities = activities.flatMap(group =>
    group.activities.filter((activity: any) =>
      activity.podcast.title.toLowerCase().includes(searchTerm.toLowerCase())
    ).map((activity: any) => ({ ...activity, date: group.date }))
  );

  if (loading && page === 0) {
    return <div className="flex justify-center items-center h-screen"><FiLoader size={48} className="text-black dark:text-white animate-spin"/></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 flex rounded-lg">
      <div className="w-3/4 pr-4">
        <h1 className="text-3xl font-bold mb-4 text-black dark:text-white">View History</h1>
        {filteredActivities.length > 0 && (
          <div>
            {filteredActivities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                {(index === 0 || activity.date !== filteredActivities[index - 1].date) && (
                  <h2 className="text-2xl font-semibold mb-2 mt-8 text-black dark:text-white">{activity.date}</h2>
                )}
                <ul className="space-y-4 my-4">
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
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </CustomButton>
          </div>
        )}
      </div>
      <div className="w-1/4 pl-4">
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
          <h2 className="text-xl text-black font-semibold mb-2">Search History</h2>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Search..."
          />
        </div>
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Actions</h2>
          <CustomButton
            onClick={clearHistory}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 w-full"
          >
            Clear All History
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default History;