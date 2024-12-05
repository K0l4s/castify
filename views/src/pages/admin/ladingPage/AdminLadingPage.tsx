import { useEffect, useState } from "react";
import { DashboardModel } from "../../../models/DashboardModel";
import { DashboardService } from "../../../services/DashboardService";
import { Podcast } from "../../../models/PodcastModel";
import { BasicUser } from "../../../models/User";
import CustomButton from "../../../components/UI/custom/CustomButton";
import { useNavigate } from "react-router-dom";

const AdminLadingPage = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardModel>({
    newUsers: [],
    newPodcasts: [],
    totalUsers: 0,
    totalPodcasts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalReportsAwait: 0,
  });
  const [prevDashboard, setPrevDashboard] = useState<DashboardModel>({
    newUsers: [],
    newPodcasts: [],
    totalUsers: 0,
    totalPodcasts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalReportsAwait: 0,
  });
  const formatLocalDateTime = (date: string): string => {
    const localDate = new Date(date);
    const offset = localDate.getTimezoneOffset() * 60000; // Chuyển đổi offset từ phút sang milliseconds
    const localISOTime = new Date(localDate.getTime() - offset)
      .toISOString()
      .slice(0, 19); // Chỉ lấy phần `yyyy-MM-ddTHH:mm:ss`
    return localISOTime;
  };
  const fetchDashboard = async (startDate: string, endDate: string) => {
    try {
      const response = await DashboardService.getDashboardInformation(formatLocalDateTime(startDate), formatLocalDateTime(endDate));
      setDashboard(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard information", error);
    }
  };
  const fetchPrevDashboard = async (startDate: string, endDate: string) => {
    try {
      const response = await DashboardService.getDashboardInformation(formatLocalDateTime(startDate), formatLocalDateTime(endDate));
      setPrevDashboard(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard information", error);
    }
  };


  const [type, setType] = useState('month');
  useEffect(() => {
    // fetchDashboard();
    // if day, send 00 -> 23h59:59 to day
    // if month, send 1 -> 30/31 to month
    // if year, send 1 -> 12 to year
    const startDate = new Date();
    const endDate = new Date();
    const prevStartDate = new Date();
    const prevEndDate = new Date();
    if (type === 'day') {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      // fetch Dashboard prev day
      prevStartDate.setDate(prevStartDate.getDate() - 1);
      prevEndDate.setDate(prevEndDate.getDate() - 1);
    } else if (type === 'month') {
      startDate.setDate(1);
      endDate.setMonth(startDate.getMonth() + 1);
      endDate.setDate(0);
      // fetchPrevMonth
      prevStartDate.setMonth(prevStartDate.getMonth() - 1);
      prevStartDate.setDate(1);
      prevEndDate.setMonth(prevEndDate.getMonth() + 1);
      prevEndDate.setDate(0);
    } else {
      startDate.setMonth(0);
      startDate.setDate(1);
      endDate.setMonth(11);
      endDate.setDate(31);
      // fetchPrevYear
      prevStartDate.setFullYear(prevStartDate.getFullYear() - 1);
      prevStartDate.setMonth(0);

    }
    fetchDashboard(startDate.toISOString(), endDate.toISOString());
    fetchPrevDashboard(prevStartDate.toISOString(), prevEndDate.toISOString());
  }, [type]);
  return (
    <div className="p-8 text-black dark:text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Blankcil Overview</h1>
      {/* month, year, day */}
      <div className="flex items-center mb-8 gap-1">
        <CustomButton onClick={() => setType('month')} variant={`${type == 'month' ? "danger" : "ghost"}`}>
          Month
        </CustomButton>
        <CustomButton onClick={() => setType('year')} variant={`${type == 'year' ? "danger" : "ghost"}`}>
          Year
        </CustomButton>
        <CustomButton onClick={() => setType('day')} variant={`${type == 'day' ? "danger" : "ghost"}`}>
          Day
        </CustomButton>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Card component */}
        {[
          {
            title: 'New Users',
            value: dashboard.totalUsers,
            prevValue: prevDashboard.totalUsers,
            color: 'text-blue-500 dark:text-blue-400',
            icon: 'fas fa-users',
            link: '/admin/user',
          },
          {
            title: 'New Podcasts',
            value: dashboard.totalPodcasts,
            prevValue: prevDashboard.totalPodcasts,
            color: 'text-green-500 dark:text-green-400',
            icon: 'fas fa-podcast',
            link: null,
          },

          // {
          //   title: 'Total Likes',
          //   value: dashboard.totalLikes,
          //   prevValue: prevDashboard.totalLikes,
          //   color: 'text-red-500 dark:text-red-400',
          //   icon: 'fas fa-thumbs-up',
          // },
          // {
          //   title: 'Total Comments',
          //   value: dashboard.totalComments,
          //   prevValue: prevDashboard.totalComments,
          //   color: 'text-purple-500 dark:text-purple-400',
          //   icon: 'fas fa-comments',
          // },
          {
            title: 'Reports Await',
            value: dashboard.totalReportsAwait,
            prevValue: prevDashboard.totalReportsAwait,
            color: 'text-yellow-500 dark:text-yellow-400',
            icon: 'fas fa-exclamation-circle',
            link: '/admin/report',
          },
        ].map((item, index) => {
          const diff = item.value - item.prevValue;
          const isPositive = diff > 0;
          const triangle = isPositive ? '🔼' : '🔽';
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center
              hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer
              "
              onClick={() => item.link ? navigate(item.link) : null}
            >
              <div className="flex items-center gap-3">
                <i className={`${item.icon} text-3xl ${item.color}`}></i>
                <h2 className="text-xl font-semibold">{item.title}</h2>
              </div>
              <p className={`text-4xl font-bold mt-4 ${item.color}`}>
                {item.value}
              </p>
              <span
                className={`text-sm mt-2 flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'
                  }`}
              >
                {triangle} {/* Dấu tam giác tăng hoặc giảm */}
                <i className={`fas ${isPositive ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                {Math.abs(diff)}
              </span>
            </div>
          );
        })}
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
                <li key={user.id} className="flex items-center mb-4 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full cursor-pointer"
                onClick={() => window.open(`/profile/${user.username}`, "_blank")}
                >
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
                <li key={podcast.id} className="mb-4 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-3 rounded-xl cursor-pointer"
                onClick={() => window.open(`/watch?pid=${podcast.id}`, "_blank")}
                >
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
