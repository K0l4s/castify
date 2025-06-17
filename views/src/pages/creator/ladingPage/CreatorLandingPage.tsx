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
import { CiShop } from "react-icons/ci";

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
    totalFrames: 0
  });
  const [prevData, setPrevData] = useState({
    totalFollowers: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0,
    topVideos: [],
    totalFrames: 0
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
      color: 'text-blue-500',
      icon: <BsPeopleFill size={28} />,
    },
    {
      title: language.creator.likes,
      value: data.totalLikes,
      prevValue: prevData.totalLikes,
      color: 'text-green-500',
      icon: <FcLike size={28} />,
    },
    {
      title: language.creator.comments,
      value: data.totalComments,
      prevValue: prevData.totalComments,
      color: 'text-red-500',
      icon: <FcComments size={28} />,
    },
    {
      title: language.creator.views,
      value: data.totalViews,
      prevValue: prevData.totalViews,
      color: 'text-yellow-500',
      icon: <BsEye size={28} />,
    },
    {
      title: "Frame",
      value: data.totalFrames,
      prevValue: prevData.totalFrames,
      color: 'text-violet-500',
      icon: <CiShop size={28} />,
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
      <div className="flex flex-row gap-3 mb-4">
        <div className="grid w-2/3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {statsCards.map((item, index) => {
            const diff = item.value - item.prevValue;
            return (
              <div
                key={index}
                className={`flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow p-4 hover:shadow-lg transition cursor-pointer`}
              >
                <div className={`mb-2 ${item.color}`}>{item.icon}</div>
                <div className={`text-lg font-semibold ${item.color}`}>{item.value.toLocaleString()}</div>
                <div className="text-xs text-gray-500 ">{item.title}</div>
                <div className="mt-1 text-xs flex items-center gap-1">
                  {diff === 0 ? (
                    <span className="text-gray-400">No change</span>
                  ) : (
                    <>
                      <span className={diff > 0 ? "text-green-700" : "text-red-700"}>
                        {diff > 0 ? "+" : ""}
                        {diff.toLocaleString()}
                        {" "}
                        ({item.prevValue === 0 ? "N/A" : `${((diff / item.prevValue) * 100 > 0 ? "+" : "")}${((diff / item.prevValue) * 100).toFixed(1)}%`})
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Bộ chọn ngày chiếm 1/3 */}
        <div className="w-full max-w-96 md:w-1/3 flex flex-col gap-3">
          {/* <h3 className="text-xl text-black dark:text-white font-bold mb-2">Date Range</h3>
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
          </div> */}
          <div className="p-4 flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl shadow h-full">
            <h2 className="text-base font-bold mb-3 text-blue-600 dark:text-blue-400">Select Date Range</h2>
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
              {dateRange.startDate?.toLocaleDateString()} - {dateRange.endDate?.toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Chart & Date Picker */}
      <div className="mb-8 flex flex-col-reverse md:flex-row gap-6">
        {/* Biểu đồ chiếm 2/3 trên màn hình md trở lên */}
        <div className="w-full">
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
