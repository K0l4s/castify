import { useEffect, useState } from "react";
import { creatorService } from "../../../services/CreatorService";
import { useToast } from "../../../context/ToastProvider";
import CustomButton from "../../../components/UI/custom/CustomButton";
import { BsEye, BsPeopleFill } from "react-icons/bs";
import { FcComments, FcLike } from "react-icons/fc";
import { useNavigate } from "react-router-dom";

const CreatorLandingPage = () => {
  const navigate = useNavigate();
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
  const [type, setType] = useState('day');

  const toast = useToast();
  const formatLocalDateTime = (date: string): string => {
    const localDate = new Date(date);
    const offset = localDate.getTimezoneOffset() * 60000; // Chuyển đổi offset từ phút sang milliseconds
    const localISOTime = new Date(localDate.getTime() - offset)
      .toISOString()
      .slice(0, 19); // Chỉ lấy phần `yyyy-MM-ddTHH:mm:ss`
    return localISOTime;
  };
  const fetchDashboard = async (start: Date, end: Date) => {
    try {
      const response = await creatorService.getDashboard(formatLocalDateTime(start.toISOString()), formatLocalDateTime(end.toISOString()));
      setData(response.data);
    } catch (error) {
      toast.error('Failed to fetch creator dashboard data');
    }
  }
  const fetchPrevDashboard = async (start: Date, end: Date) => {
    try {
      const response = await creatorService.getDashboard(formatLocalDateTime(start.toISOString()), formatLocalDateTime(end.toISOString()));
      setPrevData(response.data);
    } catch (error) {
      toast.error('Failed to fetch creator dashboard data');
    }
  }
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
    fetchDashboard(startDate, endDate);
    fetchPrevDashboard(prevStartDate, prevEndDate);
  }, [type]);

  return (
    <div className="p-4 min-h-screen ">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold ">
          Creator Overview
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 mb-12">
        {[
          {
            title: 'Followers',
            value: data.totalFollowers,
            prevValue: prevData.totalFollowers,
            color: 'text-blue-500 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            icon: <BsPeopleFill />,
            link: null,
          },
          {
            title: 'Likes',
            value: data.totalLikes,
            prevValue: prevData.totalLikes,
            color: 'text-green-500 dark:text-green-400',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            icon: <FcLike />,
            link: null,
          },
          {
            title: 'Comments',
            value: data.totalComments,
            prevValue: prevData.totalComments,
            color: 'text-red-500 dark:text-red-400',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            icon: <FcComments />,
            link: null,
          },
          {
            title: 'Views',
            value: data.totalViews,
            prevValue: prevData.totalViews,
            color: 'text-yellow-500 dark:text-yellow-400',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
            icon: <BsEye />,
            link: null,
          }
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
      {/* Top Videos */}
      <h2 className="text-xl font-semibold mb-4 text-black dark:text-gray-300">Top 10 Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 ">
        {data.topVideos.map((video: any) => (
          <div key={video.id}
            className="group hover:bg-gray-50 dark:hover:bg-gray-700 p-4 rounded-xl transition-colors duration-200 cursor-pointer"
            onClick={() => window.open(`/watch?pid=${video.id}`, "_blank")}
          >
            <div className="flex items-center space-x-6 p-2">
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-32 h-32 rounded-2xl object-cover shadow-lg group-hover:shadow-xl transform group-hover:scale-105 transition-all duration-300"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-2xl animate-pulse"></div>
              )}
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
                  {video.title}
                </h3>
                <div className="flex items-center mt-3 text-sm text-gray-600 dark:text-gray-300 space-x-4">
                  <span className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    <i className="fas fa-eye mr-2 text-green-500"></i>
                    {video.views.toLocaleString()} views
                  </span>
                  <span className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    <i className="fas fa-eye mr-2 text-green-500"></i>
                    {video.likes.toLocaleString()} likes
                  </span>
                  <span className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    <i className="fas fa-eye mr-2 text-green-500"></i>
                    {video.comments.toLocaleString()} comments
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreatorLandingPage;
