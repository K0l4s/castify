import { useEffect, useState } from "react";
import { creatorService } from "../../../services/CreatorService";
import { useToast } from "../../../context/ToastProvider";
import { BsEye, BsPeopleFill } from "react-icons/bs";
import { FcComments, FcLike } from "react-icons/fc";
import { useLanguage } from "../../../context/LanguageContext";
import PodcastStatsChart from "./PodcastStatsChart";
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const CreatorLandingPage = () => {
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date(),
  });

  const [data, setData] = useState({
    totalFollowers: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0,
    topVideos: [],
  });
  const [prevData, setPrevData] = useState({
    totalFollowers: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0,
    topVideos: [],
  });
  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchDashboard(dateRange.startDate, dateRange.endDate);
      fetchGraphData(dateRange.startDate, dateRange.endDate);

      const diff = dateRange.endDate.getTime() - dateRange.startDate.getTime();
      const prevStart = new Date(dateRange.startDate.getTime() - diff);
      const prevEnd = new Date(dateRange.endDate.getTime() - diff);
      fetchPrevDashboard(prevStart, prevEnd);
    }
  }, [dateRange]);
  const [stats, setStats] = useState<{
    labels: string[];
    views: number[];
    likes: number[];
    comments: number[];
  } | null>(null);

  const toast = useToast();
  const { language } = useLanguage();

  const formatLocalDateTime = (date: string): string => {
    const localDate = new Date(date);
    const offset = localDate.getTimezoneOffset() * 60000;
    const localISOTime = new Date(localDate.getTime() - offset)
      .toISOString()
      .slice(0, 19);
    return localISOTime;
  };

  const fetchDashboard = async (start: Date, end: Date) => {
    try {
      const response = await creatorService.getDashboard(formatLocalDateTime(start.toISOString()), formatLocalDateTime(end.toISOString()));
      setData(response.data);
    } catch {
      toast.error('Failed to fetch creator dashboard data');
    }
  };
  const fetchPrevDashboard = async (start: Date, end: Date) => {
    try {
      const response = await creatorService.getDashboard(formatLocalDateTime(start.toISOString()), formatLocalDateTime(end.toISOString()));
      setPrevData(response.data);
    } catch {
      toast.error('Failed to fetch creator dashboard data');
    }
  };
  const fetchGraphData = async (start: Date, end: Date) => {
    try {
      const response = await creatorService.getGraphDashboard(formatLocalDateTime(start.toISOString()), formatLocalDateTime(end.toISOString()));
      setStats(response.data);
    } catch {
      toast.error('Failed to fetch creator dashboard data');
    }
  };

  const resetToToday = () => {
    const today = new Date();
    setDateRange({
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999),
    });
  };

  const resetThisMonth = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    setDateRange({
      startDate: firstDayOfMonth,
      endDate: lastDayOfMonth,
    });
  };

  const resetThisYear = () => {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0);
    const lastDayOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);

    setDateRange({
      startDate: firstDayOfYear,
      endDate: lastDayOfYear,
    });
  };

  const statsCards = [
    {
      title: language.profile.followers,
      value: data.totalFollowers,
      prevValue: prevData.totalFollowers,
      color: 'text-blue-500 dark:text-blue-400',
      bgColor: 'bg-gradient-to-tr from-blue-100 via-white to-blue-50 dark:from-blue-900/40 dark:via-gray-900 dark:to-blue-900/10',
      icon: <BsPeopleFill size={28} />,
      link: null,
    },
    {
      title: language.creator.likes,
      value: data.totalLikes,
      prevValue: prevData.totalLikes,
      color: 'text-green-500 dark:text-green-400',
      bgColor: 'bg-gradient-to-tr from-green-100 via-white to-green-50 dark:from-green-900/40 dark:via-gray-900 dark:to-green-900/10',
      icon: <FcLike size={28} />,
      link: null,
    },
    {
      title: language.creator.comments,
      value: data.totalComments,
      prevValue: prevData.totalComments,
      color: 'text-red-500 dark:text-red-400',
      bgColor: 'bg-gradient-to-tr from-red-100 via-white to-red-50 dark:from-red-900/40 dark:via-gray-900 dark:to-red-900/10',
      icon: <FcComments size={28} />,
      link: null,
    },
    {
      title: language.creator.views,
      value: data.totalViews,
      prevValue: prevData.totalViews,
      color: 'text-yellow-500 dark:text-yellow-400',
      bgColor: 'bg-gradient-to-tr from-yellow-100 via-white to-yellow-50 dark:from-yellow-900/40 dark:via-gray-900 dark:to-yellow-900/10',
      icon: <BsEye size={28} />,
      link: null,
    }
  ];

  return (
    <div className="p-4 min-h-screen ">
      {/* Header */}
      {/* Stats Cards */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          {language.creator.dashboardTitle || "Creator Overview"}
        </h1>

        <div className="flex gap-2">
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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statsCards.map((item, index) => {
          const diff = item.value - item.prevValue;
          const isPositive = diff > 0;
          return (
            <div
              key={index}
              className={`${item.bgColor} p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-blue-200 dark:hover:border-blue-700 group`}
            >
              <div className="flex justify-between items-center">
                <div className={`${item.color} p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 shadow-md group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <span className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg
                  ${isPositive ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/40' :
                    'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/40'}`}>
                  {isPositive ? '▲' : '▼'} {Math.abs(diff)}
                </span>
              </div>
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{item.title}</h2>
                <p className={`text-3xl font-bold mt-2 ${item.color} tracking-tight`}>
                  {item.value.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>


      {/* Chart & Date Picker */}
      <div className="mb-8 flex flex-col-reverse md:flex-row gap-6">
        {/* Biểu đồ chiếm 2/3 trên màn hình md trở lên */}
        <div className="w-full md:w-2/3">
          {stats ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl transition-all duration-300 h-full">
              <PodcastStatsChart
                labels={stats.labels}
                views={stats.views}
                likes={stats.likes}
                comments={stats.comments}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center text-gray-500 bg-white dark:bg-gray-900 rounded-2xl shadow-xl h-full min-h-[420px]">
              <span className="animate-pulse">{language.common.loading || "Loading data..."}</span>
            </div>
          )}
        </div>

        {/* Bộ chọn ngày chiếm 1/3 */}
        <div className="w-full max-w-96 md:w-1/3 flex flex-col gap-3">
          <h3 className="text-xl text-black dark:text-white font-bold mb-2">Date Range</h3>
          <div className="rounded-2xl shadow-xl bg-white dark:bg-gray-900 p-4">
            <DateRange
              ranges={[{
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                key: 'selection',
              }]}
              onChange={(ranges: any) => {
                const { startDate, endDate } = ranges.selection;
                setDateRange({ startDate, endDate });
              }}
              maxDate={new Date()}
              moveRangeOnFirstSelection={false}
              className="rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Top Videos */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-black dark:text-gray-300">{language.creator.top10vid}</h2>

      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.topVideos.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
            {language.creator.noVideos || "No videos found."}
          </div>
        ) : (
          data.topVideos.map((video: any) => (
            <div
              key={video.id}
              className="group hover:bg-gradient-to-tr hover:from-blue-50 hover:to-white dark:hover:from-blue-900/30 dark:hover:to-gray-900 p-4 rounded-2xl transition-colors duration-200 cursor-pointer flex gap-4 shadow-lg hover:shadow-2xl border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
              onClick={() => window.open(`/watch?pid=${video.id}`, "_blank")}
              tabIndex={0}
              role="button"
              aria-label={video.title}
              onKeyDown={e => { if (e.key === "Enter") window.open(`/watch?pid=${video.id}`, "_blank"); }}
            >
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover shadow-lg group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-300"
                />
              ) : (
                <div className="w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-2xl animate-pulse"></div>
              )}
              <div className="flex-1 flex flex-col justify-between">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
                  {video.title}
                </h3>
                <div className="flex flex-wrap items-center mt-3 gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full gap-1">
                    <BsEye className="text-green-500" /> {video.views.toLocaleString()} {language.creator.views}
                  </span>
                  <span className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full gap-1">
                    <FcLike className="text-pink-500" /> {video.likes.toLocaleString()} {language.creator.likes}
                  </span>
                  <span className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full gap-1">
                    <FcComments className="text-blue-500" /> {video.comments.toLocaleString()} {language.creator.comments}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CreatorLandingPage;
