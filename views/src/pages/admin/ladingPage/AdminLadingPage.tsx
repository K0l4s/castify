import { useEffect, useState } from "react";
import { DashboardModel } from "../../../models/DashboardModel";
import { DashboardService } from "../../../services/DashboardService";
import { Podcast } from "../../../models/PodcastModel";
import { BasicUser } from "../../../models/User";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastProvider";
import { BsPeopleFill } from "react-icons/bs";
import { PiGooglePodcastsLogoBold } from "react-icons/pi";
import { FcLike } from "react-icons/fc";
import { FaRegCommentDots } from "react-icons/fa";
import { GoReport } from "react-icons/go";
import { MdCallMissedOutgoing } from "react-icons/md";
import defaultAvatar from "../../../assets/images/default_avatar.jpg";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

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
    totalAccess: 0,
  });
  const [prevDashboard, setPrevDashboard] = useState<DashboardModel>({
    newUsers: [],
    newPodcasts: [],
    totalUsers: 0,
    totalPodcasts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalReportsAwait: 0,
    totalAccess: 0,
  });

  // Date range state
  const today = new Date();
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999),
      key: "selection",
    },
  ]);

  const formatLocalDateTime = (date: string | Date): string => {
    const localDate = new Date(date);
    const offset = localDate.getTimezoneOffset() * 60000;
    const localISOTime = new Date(localDate.getTime() - offset)
      .toISOString()
      .slice(0, 19);
    return localISOTime;
  };

  const fetchDashboard = async (startDate: string, endDate: string) => {
    try {
      const response = await DashboardService.getDashboardInformation(
        formatLocalDateTime(startDate),
        formatLocalDateTime(endDate)
      );
      setDashboard(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard information", error);
      toast.error("Failed to fetch dashboard information");
    }
  };

  const fetchPrevDashboard = async (startDate: string, endDate: string) => {
    try {
      const response = await DashboardService.getDashboardInformation(
        formatLocalDateTime(startDate),
        formatLocalDateTime(endDate)
      );
      setPrevDashboard(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard information", error);
    }
  };

  const resetToToday = () => {
    const today = new Date();
    setDateRange([
      {
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999),
        key: "selection",
      },
    ]);
  };

  const resetThisMonth = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    setDateRange([
      {
        startDate: firstDayOfMonth,
        endDate: lastDayOfMonth,
        key: "selection",
      },
    ]);
  };

  const resetThisYear = () => {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0);
    const lastDayOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);

    setDateRange([
      {
        startDate: firstDayOfYear,
        endDate: lastDayOfYear,
        key: "selection",
      },
    ]);
  };

  useEffect(() => {
    const { startDate, endDate } = dateRange[0];
    const diff = endDate.getTime() - startDate.getTime();
    const prevEndDate = new Date(startDate.getTime() - 1);
    const prevStartDate = new Date(prevEndDate.getTime() - diff);

    fetchDashboard(startDate.toISOString(), endDate.toISOString());
    fetchPrevDashboard(prevStartDate.toISOString(), prevEndDate.toISOString());
    // eslint-disable-next-line
  }, [dateRange]);

  return (
    <div className="p-6 md:p-10 min-h-screen text-black dark:text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Blankcil Overview
            </h1>
            <p className="mt-2 text-lg text-gray-500 dark:text-gray-400 font-medium">
              Welcome back, Admin! Here’s what’s happening today.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button
              onClick={resetThisYear}
              className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg shadow-lg font-semibold transition-all duration-300"
            >
              This year
            </button>
             <button
              onClick={resetThisMonth}
              className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg shadow-lg font-semibold transition-all duration-300"
            >
              This month
            </button>
            <button
              onClick={resetToToday}
              className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg shadow-lg font-semibold transition-all duration-300"
            >
              Today
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="flex flex-col-reverse md:flex-row gap-6">
          {/* Stats Cards */}
          <div className="w-full md:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[
                {
                  title: "New Users",
                  value: dashboard.totalUsers,
                  prevValue: prevDashboard.totalUsers,
                  color: "text-blue-500 dark:text-blue-400",
                  bgColor: "bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30",
                  icon: <BsPeopleFill size={28} />,
                  link: "/admin/user",
                },
                {
                  title: "New Podcasts",
                  value: dashboard.totalPodcasts,
                  prevValue: prevDashboard.totalPodcasts,
                  color: "text-green-500 dark:text-green-400",
                  bgColor: "bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-800/30",
                  icon: <PiGooglePodcastsLogoBold size={28} />,
                  link: null,
                },
                {
                  title: "Total Likes",
                  value: dashboard.totalLikes,
                  prevValue: prevDashboard.totalLikes,
                  color: "text-red-500 dark:text-red-400",
                  bgColor: "bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/40 dark:to-red-800/30",
                  icon: <FcLike size={28} />,
                },
                {
                  title: "Total Comments",
                  value: dashboard.totalComments,
                  prevValue: prevDashboard.totalComments,
                  color: "text-purple-500 dark:text-purple-400",
                  bgColor: "bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/30",
                  icon: <FaRegCommentDots size={28} />,
                },
                {
                  title: "Reports Await",
                  value: dashboard.totalReportsAwait,
                  prevValue: prevDashboard.totalReportsAwait,
                  color: "text-yellow-500 dark:text-yellow-400",
                  bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/40 dark:to-yellow-800/30",
                  icon: <GoReport size={28} />,
                  link: "/admin/report",
                },
                {
                  title: "Access",
                  value: dashboard.totalAccess,
                  prevValue: prevDashboard.totalAccess,
                  color: "text-pink-500 dark:text-pink-400",
                  bgColor: "bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/40 dark:to-pink-800/30",
                  icon: <MdCallMissedOutgoing size={28} />,
                  link: null,
                },
              ].map((item, index) => {
                const diff = item.value - item.prevValue;
                const isPositive = diff > 0;
                return (
                  <div
                    key={index}
                    className={`${item.bgColor} p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-blue-300 dark:hover:border-blue-700
            ${item.link ? "cursor-pointer transform hover:scale-105" : ""}`}
                    onClick={() => (item.link ? navigate(item.link) : null)}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`${item.color} p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 shadow-md`}>
                        {item.icon}
                      </div>
                      <span
                        className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg
                ${isPositive
                            ? "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/40"
                            : "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/40"
                          }`}
                      >
                        {isPositive ? (
                          <svg width="16" height="16" fill="currentColor" className="inline" viewBox="0 0 16 16">
                            <path d="M8 12V4m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" fill="currentColor" className="inline" viewBox="0 0 16 16">
                            <path d="M8 4v8m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {Math.abs(diff)}
                      </span>
                    </div>
                    <div className="mt-6">
                      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{item.title}</h2>
                      <p className={`text-3xl font-extrabold mt-2 ${item.color}`}>{item.value.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Date Picker */}
          <div className="w-full md:w-1/3 flex flex-col items-center gap-4 p-2">
            <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 flex flex-col items-center">
              <h2 className="text-xl font-bold mb-2 text-blue-600 dark:text-blue-400">Date Picker</h2>
              <DateRange
                editableDateInputs={true}
                onChange={(item) => {
                  const selection = item.selection;
                  setDateRange([
                    {
                      startDate: selection.startDate ?? today,
                      endDate: selection.endDate ?? today,
                      key: selection.key ?? "selection",
                    },
                  ]);
                }}
                moveRangeOnFirstSelection={false}
                ranges={dateRange}
                maxDate={today}
                rangeColors={["#2563eb"]}
                className="rounded-md"
              />
            </div>
          </div>
        </div>

        {/* New Users & Podcasts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
          {/* New Users */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
              <BsPeopleFill className="text-blue-500" /> New Users Register
            </h2>
            <div className="space-y-4">
              {dashboard.newUsers.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No new users</p>
              ) : (
                dashboard.newUsers.map((user: BasicUser) => (
                  <div
                    key={user.id}
                    className="flex items-center p-4 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-lg"
                    onClick={() => window.open(`/profile/${user.username}`, "_blank")}
                  >
                    <div className="relative">
                      <img
                        src={user.avatarUrl ? user.avatarUrl : defaultAvatar}
                        alt={user.fullname}
                        className="w-12 h-12 rounded-full object-cover shadow-md ring-2 ring-offset-2 ring-blue-400/60 hover:ring-blue-500"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="font-semibold text-gray-800 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                        {user.fullname}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                        @{user.username}
                      </p>
                    </div>
                    <div className="text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* New Podcasts */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
              <PiGooglePodcastsLogoBold className="text-green-500" /> New Podcasts Uploaded
            </h2>
            <div className="space-y-4">
              {dashboard.newPodcasts.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No new podcasts</p>
              ) : (
                dashboard.newPodcasts.map((podcast: Podcast) => (
                  <div
                    key={podcast.id}
                    className="group hover:bg-green-50 dark:hover:bg-green-900/30 p-4 rounded-xl transition-colors duration-200 cursor-pointer flex items-center gap-4"
                    onClick={() => window.open(`/watch?pid=${podcast.id}`, "_blank")}
                  >
                    {podcast.thumbnailUrl ? (
                      <img
                        src={podcast.thumbnailUrl || defaultAvatar}
                        alt={podcast.title}
                        className="w-20 h-20 rounded-2xl object-cover shadow-lg group-hover:shadow-xl transform group-hover:scale-105 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-2xl animate-pulse"></div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200 line-clamp-2">
                        {podcast.title}
                      </h3>
                      <div className="flex items-center mt-3 text-sm text-gray-600 dark:text-gray-300 space-x-4">
                        <span className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                          <img
                            src={podcast.user.avatarUrl || defaultAvatar}
                            alt={podcast.user.username}
                            className="w-4 h-4 rounded-full mr-2"
                          />
                          {podcast.user.username}
                        </span>
                        <span className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                          <i className="fas fa-eye mr-2 text-green-500"></i>
                          {podcast.views.toLocaleString()} views
                        </span>
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
