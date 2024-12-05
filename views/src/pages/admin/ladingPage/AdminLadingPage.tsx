import { useEffect, useState } from "react";
import { DashboardModel } from "../../../models/DashboardModel";
import { DashboardService } from "../../../services/DashboardService";
import { Podcast } from "../../../models/PodcastModel";
import { BasicUser } from "../../../models/User";

const AdminLadingPage = () => {
  const [dashboard, setDashboard] = useState<DashboardModel>({
    newUsers: [],
    newPodcasts: [],
    totalUsers: 0,
    totalPodcasts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalReportsAwait: 0,
  });

  const fetchDashboard = async () => {
    try {
      const response = await DashboardService.getDashboardInformation();
      setDashboard(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard information", error);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="p-8 text-black dark:text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Blankcil Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Tổng số người dùng */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Total Users</h2>
          <p className="text-4xl font-bold text-blue-500 dark:text-blue-400">
            {dashboard.totalUsers}
          </p>
        </div>

        {/* Tổng số podcasts */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Total Podcasts</h2>
          <p className="text-4xl font-bold text-green-500 dark:text-green-400">
            {dashboard.totalPodcasts}
          </p>
        </div>

        {/* Tổng số likes */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Total Likes</h2>
          <p className="text-4xl font-bold text-red-500 dark:text-red-400">
            {dashboard.totalLikes}
          </p>
        </div>

        {/* Tổng số comments */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Total Comments</h2>
          <p className="text-4xl font-bold text-purple-500 dark:text-purple-400">
            {dashboard.totalComments}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Total Reports Await</h2>
          <p className="text-4xl font-bold text-purple-500 dark:text-purple-400">
            {dashboard.totalReportsAwait}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Danh sách người dùng mới */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">New Users Register</h2>
          <ul>
            {dashboard.newUsers.length === 0 ? (
              <p>No new users</p>
            ) : (
              dashboard.newUsers.map((user: BasicUser) => (
                <li key={user.id} className="flex items-center mb-4">
                  <img
                    src={user.avatarUrl}
                    alt={user.fullname}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <p className="font-semibold">{user.fullname}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      @{user.username}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Danh sách podcast mới */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">New Podcasts Uploaded</h2>
          <ul>
            {dashboard.newPodcasts.length === 0 ? (
              <p>No new podcasts</p>
            ) : (
              dashboard.newPodcasts.map((podcast: Podcast) => (
                <li key={podcast.id} className="mb-4">
                  <div className="flex items-center">
                    {podcast.thumbnailUrl ? (
                      <img
                        src={podcast.thumbnailUrl}
                        alt={podcast.title}
                        className="w-16 h-16 rounded-lg mr-4"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-lg mr-4"></div>
                    )}
                    <div>
                      <p className="font-semibold">{podcast.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        By {podcast.username} | {podcast.views} views
                      </p>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminLadingPage;
