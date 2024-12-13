import { useEffect, useState } from "react";
import { DashboardModel } from "../../../models/DashboardModel";
import { DashboardService } from "../../../services/DashboardService";
import { Podcast } from "../../../models/PodcastModel";
import { BasicUser } from "../../../models/User";
import CustomButton from "../../../components/UI/custom/CustomButton";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastProvider";

const AdminLadingPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [dashboard, setDashboard] = useState<DashboardModel>({
    newUsers: [],
    newPodcasts: [],
    totalUsers: 0,
    totalPodcasts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalReportsAwait: 0,
    totalAccess:0
  });
  const [prevDashboard, setPrevDashboard] = useState<DashboardModel>({
    newUsers: [],
    newPodcasts: [],
    totalUsers: 0,
    totalPodcasts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalReportsAwait: 0,
    totalAccess:0
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
      toast.error("Failed to fetch dashboard information");
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
    const startDate = new Date();
    const endDate = new Date();
    const prevStartDate = new Date();
    const prevEndDate = new Date();

    if (type === 'day') {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      prevStartDate.setDate(prevStartDate.getDate() - 1);
      prevStartDate.setHours(0, 0, 0, 0);
      prevEndDate.setDate(prevEndDate.getDate() - 1); 
      prevEndDate.setHours(23, 59, 59, 999);

    } else if (type === 'month') {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);

      prevStartDate.setMonth(prevStartDate.getMonth() - 1);
      prevStartDate.setDate(1);
      prevStartDate.setHours(0, 0, 0, 0);
      prevEndDate.setMonth(prevEndDate.getMonth());
      prevEndDate.setDate(0);
      prevEndDate.setHours(23, 59, 59, 999);

    } else {
      startDate.setMonth(0);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(11);
      endDate.setDate(31);
      endDate.setHours(23, 59, 59, 999);

      prevStartDate.setFullYear(prevStartDate.getFullYear() - 1);
      prevStartDate.setMonth(0);
      prevStartDate.setDate(1);
      prevStartDate.setHours(0, 0, 0, 0);
      prevEndDate.setFullYear(prevEndDate.getFullYear() - 1);
      prevEndDate.setMonth(11);
      prevEndDate.setDate(31);
      prevEndDate.setHours(23, 59, 59, 999);
    }

    fetchDashboard(startDate.toISOString(), endDate.toISOString());
    fetchPrevDashboard(prevStartDate.toISOString(), prevEndDate.toISOString());
  }, [type]);
  return (
    <div className="p-8 text-black dark:text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold ">
            Blankcil Overview
          </h1>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-md">
          <CustomButton onClick={() => setType('year')} variant={`${type == 'year' ? "danger" : "ghost"}`} className="rounded-lg px-6">
              Year
            </CustomButton>
            <CustomButton onClick={() => setType('month')} variant={`${type == 'month' ? "danger" : "ghost"}`} className="rounded-lg px-6">
              Month
            </CustomButton>
            <CustomButton onClick={() => setType('day')} variant={`${type == 'day' ? "danger" : "ghost"}`} className="rounded-lg px-6">
              Day
            </CustomButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-12">
          {[
            {
              title: 'New Users',
              value: dashboard.totalUsers,
              prevValue: prevDashboard.totalUsers,
              color: 'text-blue-500 dark:text-blue-400',
              bgColor: 'bg-blue-50 dark:bg-blue-900/20',
              icon: 'fas fa-users',
              link: '/admin/user',
            },
            {
              title: 'New Podcasts',
              value: dashboard.totalPodcasts,
              prevValue: prevDashboard.totalPodcasts,
              color: 'text-green-500 dark:text-green-400',
              bgColor: 'bg-green-50 dark:bg-green-900/20',
              icon: 'fas fa-podcast',
              link: null,
            },
            {
              title: 'Total Likes',
              value: dashboard.totalLikes,
              prevValue: prevDashboard.totalLikes,
              color: 'text-red-500 dark:text-red-400',
              bgColor: 'bg-red-50 dark:bg-red-900/20',
              icon: 'fas fa-thumbs-up',
            },
            {
              title: 'Total Comments',
              value: dashboard.totalComments,
              prevValue: prevDashboard.totalComments,
              color: 'text-purple-500 dark:text-purple-400',
              bgColor: 'bg-purple-50 dark:bg-purple-900/20',
              icon: 'fas fa-comments',
            },
            {
              title: 'Reports Await',
              value: dashboard.totalReportsAwait,
              prevValue: prevDashboard.totalReportsAwait,
              color: 'text-yellow-500 dark:text-yellow-400',
              bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
              icon: 'fas fa-exclamation-circle',
              link: '/admin/report',
            },
            {
              title: 'Access',
              value: dashboard.totalAccess,
              prevValue: prevDashboard.totalAccess,
              color: 'text-pink-500 dark:text-pink-400',
              bgColor: 'bg-pink-50 dark:bg-pink-900/20',
              icon: 'fas fa-exclamation-circle',
              link: null,
            },
          ].map((item, index) => {
            const diff = item.value - item.prevValue;
            const isPositive = diff > 0;
            return (
              <div
                key={index}
                className={`${item.bgColor} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300
                ${item.link ? 'cursor-pointer transform hover:scale-105' : ''}`}
                onClick={() => item.link ? navigate(item.link) : null}
              >
                <div className="flex justify-between items-start">
                  <div className={`${item.color} p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 shadow-md`}>
                    <i className={`${item.icon} text-2xl`}></i>
                  </div>
                  <span className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg
                    ${isPositive ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/40' : 
                    'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/40'}`}>
                    {isPositive ? '↑' : '↓'} {Math.abs(diff)}
                  </span>
                </div>
                <div className="mt-4">
                  <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{item.title}</h2>
                  <p className={`text-3xl font-bold mt-2 ${item.color}`}>
                    {item.value.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">New Users Register</h2>
            <div className="space-y-4">
              {dashboard.newUsers.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No new users</p>
              ) : (
                dashboard.newUsers.map((user: BasicUser) => (
                  <div key={user.id} 
                    className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200 cursor-pointer"
                    onClick={() => window.open(`/profile/${user.username}`, "_blank")}
                  >
                    <img
                      src={user.avatarUrl}
                      alt={user.fullname}
                      className="w-12 h-12 rounded-full object-cover shadow-md"
                    />
                    <div className="ml-4">
                      <p className="font-semibold text-gray-800 dark:text-white">{user.fullname}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">New Podcasts Uploaded</h2>
            <div className="space-y-4">
              {dashboard.newPodcasts.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No new podcasts</p>
              ) : (
                dashboard.newPodcasts.map((podcast: Podcast) => (
                  <div key={podcast.id} 
                    className="group hover:bg-gray-50 dark:hover:bg-gray-700 p-4 rounded-xl transition-colors duration-200 cursor-pointer"
                    onClick={() => window.open(`/watch?pid=${podcast.id}`, "_blank")}
                  >
                    <div className="flex items-center space-x-4">
                      {podcast.thumbnailUrl ? (
                        <img
                          src={podcast.thumbnailUrl}
                          alt={podcast.title}
                          className="w-20 h-20 rounded-xl object-cover shadow-md group-hover:shadow-lg transition-shadow duration-200"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200">
                          {podcast.title}
                        </h3>
                        <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <i className="fas fa-user mr-2"></i>
                            {podcast.username}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="flex items-center">
                            <i className="fas fa-eye mr-2"></i>
                            {podcast.views} views
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLadingPage;
