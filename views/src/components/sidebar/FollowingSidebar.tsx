import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from '../../assets/images/default_avatar.jpg';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { userService } from '../../services/UserService';
import { RootState } from '../../redux/store';
import Avatar from '../UI/user/Avatar';
import { useLanguage } from '../../context/LanguageContext';

interface FollowedUser {
  id: string;
  fullname: string;
  username: string;
  avatarUrl: string | null;
  usedFrame: any | null;
  totalFollower: number;
  totalFollowing: number;
  totalPost: number;
  follow: boolean;
}

interface FollowingSidebarProps {
  isOpen: boolean;
}

const FollowingSidebar: React.FC<FollowingSidebarProps> = ({ isOpen }) => {
  const [followingUsers, setFollowingUsers] = useState<FollowedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(false);
  const navigate = useNavigate();
  const {language} = useLanguage();
  
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchFollowingUsers = async () => {
      if (!isAuthenticated || !currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await userService.getFollowings(currentUser.username, 0, 10);
        setFollowingUsers(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching following users:', err);
        setError('Failed to load following users');
        setLoading(false);
      }
    };

    fetchFollowingUsers();
  }, [isAuthenticated, currentUser]);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleUserClick = (username: string) => {
    navigate(`/profile/${username}`);
  };

  if (!isAuthenticated) return null;
  
  if (loading) {
    return (
      <div className="mt-4">
        <p className="text-sm text-black dark:text-gray-200 px-2 font-medium mb-2">
          {isOpen && <span>{language.sidebar.following}</span>}
        </p>
        <div className="animate-pulse space-y-2">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center gap-2 px-2 py-1">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              {isOpen && <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="mt-4">
        <p className="text-sm text-black dark:text-gray-200 px-2 font-medium mb-2">
          {isOpen && <span>{language.sidebar.following}</span>}
        </p>
        <p className="text-xs text-red-500 px-2">{isOpen && error}</p>
      </div>
    );
  }

  // If no following users
  if (followingUsers.length === 0) {
    return (
      <div className="mt-4">
        <p className="text-sm text-black dark:text-gray-200 px-2 font-medium mb-2">
          {isOpen && <span>{language.sidebar.following}</span>}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 px-2">
          {isOpen && 'You are not following anyone yet'}
        </p>
      </div>
    );
  }

  // Default display with following users
  const displayUsers = expanded ? followingUsers : followingUsers.slice(0, 5);

  return (
    <div className="mt-4 px-2">
      <div className="h-[1px] w-full bg-black dark:bg-gray-200 my-4"></div>

      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-black dark:text-gray-200 font-medium">
          {isOpen && <span>{language.sidebar.following}</span>}
        </p>
      </div>

      <ul className="space-y-1">
        {displayUsers.map((user) => (
          <li key={user.id}>
            <button
              title={user.fullname}
              onClick={() => handleUserClick(user.username)}
              className="w-full flex items-center py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Avatar
                avatarUrl={user.avatarUrl || defaultAvatar}
                usedFrame={user.usedFrame}
                width="w-8"
                height="h-8"
              />
              {isOpen && (
                <span className="truncate ml-2 font-semibold line-clamp-1">{user.fullname}</span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* Only show the toggle button if there are more than 5 users and sidebar is open */}
      {isOpen && followingUsers.length > 5 && (
        <button 
          onClick={toggleExpand}
          className="w-full mt-2 py-1 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-center"
        >
          {expanded ? (
            <>
              <span className="mr-1">Show less</span>
              <FiChevronUp size={14} />
            </>
          ) : (
            <>
              <span className="mr-1">View all</span>
              <FiChevronDown size={14} />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default FollowingSidebar;