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
import PodcastStatsChart from "../../creator/ladingPage/PodcastStatsChart";

const AdminLadingPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [stats, setStats] = useState<{
    labels: string[];
    views: number[];
    likes: number[];
    comments: number[];
  } | null>(null);

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
  const fetchGraph = async (startDate: string, endDate: string) => {
    try {
      const response = await DashboardService.getAdminGraphDashboard(
        formatLocalDateTime(startDate),
        formatLocalDateTime(endDate)
      );
      console.log(response.data);
      setStats(response.data)
      // setDashboard(response.data);
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
    fetchGraph(startDate.toISOString(), endDate.toISOString());
    // eslint-disable-next-line
  }, [dateRange]);

  return (
    <div className="px-6 md:px-10 pt-6 md:pt-10 min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 text-black dark:text-white">
      <div className=" mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Admin Overview
            </h1>
            <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
              Welcome back! Here’s your dashboard.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={resetThisYear} className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm">Year</button>
            <button onClick={resetThisMonth} className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm">Month</button>
            <button onClick={resetToToday} className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm">Today</button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            {
              title: "Users",
              value: dashboard.totalUsers,
              icon: <BsPeopleFill size={22} />,
              color: "text-blue-500",
              link: "/admin/user",
            },
            {
              title: "Podcasts",
              value: dashboard.totalPodcasts,
              icon: <PiGooglePodcastsLogoBold size={22} />,
              color: "text-green-500",
            },
            {
              title: "Likes",
              value: dashboard.totalLikes,
              icon: <FcLike size={22} />,
              color: "text-red-500",
            },
            {
              title: "Comments",
              value: dashboard.totalComments,
              icon: <FaRegCommentDots size={22} />,
              color: "text-purple-500",
            },
            {
              title: "Reports",
              value: dashboard.totalReportsAwait,
              icon: <GoReport size={22} />,
              color: "text-yellow-500",
              link: "/admin/report",
            },
            {
              title: "Access",
              value: dashboard.totalAccess,
              icon: <MdCallMissedOutgoing size={22} />,
              color: "text-pink-500",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow p-4 hover:shadow-lg transition cursor-pointer`}
              onClick={() => item.link && navigate(item.link)}
            >
              <div className={`mb-2 ${item.color}`}>{item.icon}</div>
              <div className="text-lg font-semibold">{item.value.toLocaleString()}</div>
              <div className="text-xs text-gray-500">{item.title}</div>
            </div>
          ))}
        </div>

        {/* Date Picker & Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl shadow h-full">
            <h2 className="text-base font-bold mb-3 text-blue-600 dark:text-blue-400">Select Date Range</h2>
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
              className="rounded-lg  mx-auto bg-transparent"
            />
            <div className="flex gap-2 mt-4">
              <button
              onClick={resetToToday}
              className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-xs"
              >
              Today
              </button>
              <button
              onClick={resetThisMonth}
              className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-xs"
              >
              Month
              </button>
              <button
              onClick={resetThisYear}
              className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-xs"
              >
              Year
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              {dateRange[0].startDate?.toLocaleDateString()} - {dateRange[0].endDate?.toLocaleDateString()}
            </div>
            </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <PodcastStatsChart
              labels={stats?.labels ?? []}
              views={stats?.views ?? []}
              likes={stats?.likes ?? []}
              comments={stats?.comments ?? []}
            />
          </div>
        </div>

        {/* New Users & Podcasts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* New Users */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-500">
              <BsPeopleFill /> New Users
            </h2>
            <div className="space-y-2">
              {dashboard.newUsers.length === 0 ? (
                <p className="text-gray-400 text-center">No new users</p>
              ) : (
                dashboard.newUsers.slice(0, 5).map((user: BasicUser) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer"
                    onClick={() => window.open(`/profile/${user.username}`, "_blank")}
                  >
                    <img
                      src={user.avatarUrl || defaultAvatar}
                      alt={user.fullname}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium">{user.fullname}</div>
                      <div className="text-xs text-gray-500">@{user.username}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* New Podcasts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-500">
              <PiGooglePodcastsLogoBold /> New Podcasts
            </h2>
            <div className="space-y-2">
              {dashboard.newPodcasts.length === 0 ? (
                <p className="text-gray-400 text-center">No new podcasts</p>
              ) : (
                dashboard.newPodcasts.slice(0, 5).map((podcast: Podcast) => (
                  <div
                    key={podcast.id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-green-50 dark:hover:bg-green-900/30 cursor-pointer"
                    onClick={() => window.open(`/watch?pid=${podcast.id}`, "_blank")}
                  >
                    <img
                      src={podcast.thumbnailUrl || defaultAvatar}
                      alt={podcast.title}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <div className="font-medium line-clamp-1">{podcast.title}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <img
                          src={podcast.user.avatarUrl || defaultAvatar}
                          alt={podcast.user.username}
                          className="w-4 h-4 rounded-full"
                        />
                        {podcast.user.username} · {podcast.views.toLocaleString()} views
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
