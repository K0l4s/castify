import React, { useState } from 'react';
import { UserSimple } from '../../../models/User';
import Avatar from './Avatar';
import CustomButton from '../custom/CustomButton';
import { FiUserPlus, FiUserCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { userService } from '../../../services/UserService';
import { useToast } from '../../../context/ToastProvider';
import { useLanguage } from '../../../context/LanguageContext';

interface UserCardProps {
  user: UserSimple;
  onUserUpdated?: (updatedUser: UserSimple) => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onUserUpdated
}) => {
  const navigate = useNavigate();
  const toast = useToast();
  const {language} = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const handleProfileClick = () => {
    navigate(`/profile/${user.username}`);
  };

  const handleFollowClick = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to follow users');
      return;
    }

    if (currentUser && currentUser.id === user.id) {
      toast.error("You can't follow yourself");
      return;
    }

    setIsLoading(true);

    try {
      await userService.followUser(user.username);
      
      const updatedUser: UserSimple = {
        ...user,
        follow: !user.follow,
        totalFollower: user.follow ? user.totalFollower - 1 : user.totalFollower + 1
      };
      
      onUserUpdated?.(updatedUser);
      
      toast.success(user.follow ? `Unfollowed ${user.fullname}` : `Following ${user.fullname}`);
      
    } catch (error) {
      console.error('Follow error:', error);
      toast.error('Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden group">
      <div 
        onClick={handleProfileClick}
        className="p-6 text-center cursor-pointer"
      >
        {/* Avatar */}
        <div className="mb-4 flex justify-center">
          <Avatar
            avatarUrl={user.avatarUrl}
            width="w-20"
            height="h-20"
            alt={user.fullname}
            usedFrame={user.usedFrame}
          />
        </div>

        {/* User Info */}
        <div className="mb-4">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {user.fullname}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 overflow-hidden text-ellipsis whitespace-nowrap" title={user.username}>
            @{user.username}
          </p>
          
          {/* Follower count */}
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {user.totalFollower.toLocaleString()}
              </span>
              <span className="ml-1">{language.common.followers || 'followers'}</span>
            </div>
          </div>
        </div>
      </div>

      <div 
        className="px-6 pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Follow Button - Only show if not current user */}
        {isAuthenticated && currentUser && currentUser.id !== user.id && (
          <CustomButton
            text={user.follow ? language.common.following || "Following" : language.common.follow || "Follow"}
            icon={user.follow ? <FiUserCheck /> : <FiUserPlus />}
            variant={user.follow ? "outline" : "primary"}
            size="sm"
            className="w-full"
            disabled={isLoading}
            loading={isLoading} 
            onClick={handleFollowClick}
          />
        )}
        
        {/* Guest users see follow button but it triggers login */}
        {!isAuthenticated && (
          <CustomButton
            text="Follow"
            icon={<FiUserPlus />}
            variant="primary"
            size="sm"
            className="w-full"
            onClick={handleFollowClick} // ✅ No event parameter needed
          />
        )}
      </div>
    </div>
  );
};

export default UserCard;