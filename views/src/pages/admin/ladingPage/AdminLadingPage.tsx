import { useEffect, useState } from "react";
import { DashboardModel } from "../../../models/DashboardModel";
import { DashboardService } from "../../../services/DashboardService";
import { Podcast } from "../../../models/PodcastModel";
import { BasicUser } from "../../../models/User";
import CustomButton from "../../../components/UI/custom/CustomButton";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastProvider";
import { BsPeopleFill } from "react-icons/bs";
import { PiGooglePodcastsLogoBold } from "react-icons/pi";
import { FcLike } from "react-icons/fc";
import { FaRegCommentDots } from "react-icons/fa";
import { GoReport } from "react-icons/go";
import { MdCallMissedOutgoing } from "react-icons/md";

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


  const [type, setType] = useState('day');
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
              icon: <BsPeopleFill/> ,
              link: '/admin/user',
            },
            {
              title: 'New Podcasts',
              value: dashboard.totalPodcasts,
              prevValue: prevDashboard.totalPodcasts,
              color: 'text-green-500 dark:text-green-400',
              bgColor: 'bg-green-50 dark:bg-green-900/20',
              icon: <PiGooglePodcastsLogoBold/>,
              link: null,
            },
            {
              title: 'Total Likes',
              value: dashboard.totalLikes,
              prevValue: prevDashboard.totalLikes,
              color: 'text-red-500 dark:text-red-400',
              bgColor: 'bg-red-50 dark:bg-red-900/20',
              icon: <FcLike /> ,
            },
            {
              title: 'Total Comments',
              value: dashboard.totalComments,
              prevValue: prevDashboard.totalComments,
              color: 'text-purple-500 dark:text-purple-400',
              bgColor: 'bg-purple-50 dark:bg-purple-900/20',
              icon: <FaRegCommentDots/> ,
            },
            {
              title: 'Reports Await',
              value: dashboard.totalReportsAwait,
              prevValue: prevDashboard.totalReportsAwait,
              color: 'text-yellow-500 dark:text-yellow-400',
              bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
              icon: <GoReport/> ,
              link: '/admin/report',
            },
            {
              title: 'Access',
              value: dashboard.totalAccess,
              prevValue: prevDashboard.totalAccess,
              color: 'text-pink-500 dark:text-pink-400',
              bgColor: 'bg-pink-50 dark:bg-pink-900/20',
              icon: <MdCallMissedOutgoing /> ,
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
                    {/* <i className={`${item.icon} text-2xl`}></i> */}
                    {item.icon}
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
                    className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-300 cursor-pointer transform hover:scale-102 hover:shadow-lg"
                    onClick={() => window.open(`/profile/${user.username}`, "_blank")}
                  >
                    <div className="relative">
                      <img
                        src={user.avatarUrl}
                        alt={user.fullname}
                        className="w-12 h-12 rounded-full object-cover shadow-md ring-2 ring-offset-2 ring-blue-500/50 hover:ring-blue-500"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="font-semibold text-gray-800 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors">{user.fullname}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">@{user.username}</p>
                    </div>
                    <div className="text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
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
                    <div className="flex items-center space-x-6 p-2">
                      {podcast.thumbnailUrl ? (
                        <img
                          src={podcast.thumbnailUrl}
                          alt={podcast.title}
                          className="w-24 h-24 rounded-2xl object-cover shadow-lg group-hover:shadow-xl transform group-hover:scale-105 transition-all duration-300"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-2xl animate-pulse"></div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
                          {podcast.title}
                        </h3>
                        <div className="flex items-center mt-3 text-sm text-gray-600 dark:text-gray-300 space-x-4">
                          <span className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                            <img src={podcast.user.avatarUrl} alt={podcast.user.username} className="w-4 h-4 rounded-full mr-2" />
                            {podcast.user.username}
                          </span>
                          <span className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                            <i className="fas fa-eye mr-2 text-green-500"></i>
                            {podcast.views.toLocaleString()} views
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
