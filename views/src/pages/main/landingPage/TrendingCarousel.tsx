import React, { useEffect, useState } from 'react';
import { Podcast } from '../../../models/PodcastModel';
import { getTrendingPodcast } from '../../../services/PodcastService';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlay } from 'react-icons/fa';
import { formatViewsToShortly } from '../../../utils/formatViews';
import { CgEyeAlt } from 'react-icons/cg';
import { BsClock } from 'react-icons/bs';
import Avatar from '../../../components/UI/user/Avatar';
import defaultAvatar from '../../../assets/images/default_avatar.jpg';
import { formatRelativeTime } from '../../../utils/DateUtils';
import { useLanguage } from '../../../context/LanguageContext';

const TrendingCarousel: React.FC = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const {language, currentLang} = useLanguage();

  useEffect(() => {
    const fetchTrendingPodcasts = async () => {
      try {
        setLoading(true);
        const response = await getTrendingPodcast(0, 20);
        setPodcasts(response.content);
      } catch (error) {
        console.error('Error fetching trending podcasts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingPodcasts();
  }, []);

  useEffect(() => {
    // Auto-advance the carousel every 5 seconds
    const interval = setInterval(() => {
      if (podcasts.length > 0) {
        setActiveIndex((current) => (current + 1) % podcasts.length);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [podcasts.length]);

  const handleIndicatorClick = (index: number) => {
    setActiveIndex(index);
  };

  const handlePrevious = () => {
    setActiveIndex((current) => (current === 0 ? podcasts.length - 1 : current - 1));
  };

  const handleNext = () => {
    setActiveIndex((current) => (current + 1) % podcasts.length);
  };

  if (loading) {
    return (
      <div className="relative w-full h-[500px] bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!podcasts.length) {
    return null;
  }

  const activePodcast = podcasts[activeIndex];

  return (
    <div className="relative md:w-3/5 w-full h-[440px] rounded-xl overflow-hidden group">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out transform scale-105 group-hover:scale-110"
        style={{ 
          backgroundImage: `url(${activePodcast.thumbnailUrl || 'https://img.freepik.com/free-photo/cement-texture_1194-6523.jpg?semt=ais_hybrid'})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row h-full">
        <div className="flex-1 flex flex-col justify-center px-8 md:px-16 py-8">
          <div className="mb-4">
            <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold mb-2">
              {language.trending.trending} #{activeIndex + 1}
            </span>
          </div>
          
          <h2 className="text-white text-2xl md:text-3xl font-bold mb-4 line-clamp-2">
            {activePodcast.title}
          </h2>
          
          <div className="flex items-center gap-3 mb-6">
            <Avatar 
              avatarUrl={activePodcast.user.avatarUrl || defaultAvatar} 
              width="w-12" 
              height="h-12" 
              usedFrame={activePodcast.user.usedFrame}
              alt={activePodcast.user.username}
              onClick={() => navigate(`/profile/${activePodcast.user.username}`)}
            />
            <div>
              <p className="text-white text-lg font-medium">{activePodcast.user.fullname}</p>
              <div className="flex items-center gap-3 text-gray-300">
                <span className="flex items-center gap-1">
                  <CgEyeAlt />
                  {formatViewsToShortly(activePodcast.views)} views
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <BsClock />
                  {formatRelativeTime(activePodcast.createdDay, currentLang)}
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-gray-300 mb-8 line-clamp-3 md:max-w-2xl">
            {activePodcast.content}
          </p>
          
          <div className="flex gap-4">
            <Link 
              to={`/watch?pid=${activePodcast.id}`}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105"
            >
              <FaPlay />
              {language.trending.playNow}
            </Link>
          </div>
        </div>
        
        {/* Featured image (optional, can be visible only on larger screens) */}
        <div className="hidden lg:flex items-center justify-center w-1/3 p-8">
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl shadow-2xl transform transition-all group-hover:scale-105">
            <img 
              src={activePodcast.thumbnailUrl || 'https://img.freepik.com/free-photo/cement-texture_1194-6523.jpg?semt=ais_hybrid'} 
              alt={activePodcast.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => navigate(`/watch?pid=${activePodcast.id}`)}
            >
              <div className="bg-white/90 p-4 rounded-full">
                <FaPlay className="text-red-600 w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <button 
        className="z-20 absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handlePrevious}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button 
        className="z-20 absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleNext}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Indicators */}
      <div className="z-20 absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {podcasts.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              index === activeIndex ? 'bg-red-600 w-6' : 'bg-white/50 hover:bg-white/80'
            }`}
            onClick={() => handleIndicatorClick(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TrendingCarousel;