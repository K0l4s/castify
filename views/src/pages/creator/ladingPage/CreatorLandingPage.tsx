import { useEffect, useState } from "react";
import { creatorService } from "../../../services/CreatorService";
import { useToast } from "../../../context/ToastProvider";

const CreatorLandingPage = () => {
  const [data, setData] = useState({
    totalFollowers: 0,
    totalLikes: 0,
    totalComments: 0,
    topVideos: [],
  });
  const toast = useToast();

  useEffect(() => {
    creatorService
      .getDashboard()
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load dashboard data");
      });
  }, []);

  return (
    <div className="p-4 min-h-screen ">
      <h1 className="text-2xl font-bold mb-6 text-black dark:text-white">Creator Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-500 text-white rounded-lg shadow-md dark:bg-blue-600">
          <h2 className="text-lg font-semibold">Total Followers</h2>
          <p className="text-3xl font-bold">{data.totalFollowers}</p>
        </div>
        <div className="p-4 bg-green-500 text-white rounded-lg shadow-md dark:bg-green-600">
          <h2 className="text-lg font-semibold">Total Likes</h2>
          <p className="text-3xl font-bold">{data.totalLikes}</p>
        </div>
        <div className="p-4 bg-yellow-500 text-white rounded-lg shadow-md dark:bg-yellow-600">
          <h2 className="text-lg font-semibold">Total Comments</h2>
          <p className="text-3xl font-bold">{data.totalComments}</p>
        </div>
      </div>

      {/* Top Videos */}
      <h2 className="text-xl font-semibold mb-4 text-black dark:text-gray-300">Top 10 Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.topVideos.map((video: any) => (
          <div key={video.id} className="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-700">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-32 object-cover rounded-t-lg mb-2"
            />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-200">{video.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {video.likes} Likes • {video.comments} Comments • {video.views} Views
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreatorLandingPage;
