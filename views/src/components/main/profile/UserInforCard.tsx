import { FaUserFriends } from 'react-icons/fa';
import { LuUserX2 } from 'react-icons/lu';
import { userCard } from '../../../models/User';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../../services/UserService';
import { useToast } from '../../../context/ToastProvider';
import { useState } from 'react';
import Avatar from '../../UI/user/Avatar';

const UserInforCard = (user: userCard) => {
  const [isFollow, setIsFollow] = useState(user.follow);
  const navigate = useNavigate();
  const toast = useToast();

  const toggleFollow = async () => {
    try {
      await userService.followUser(user.username);
      setIsFollow(!isFollow);
      toast.success(
        isFollow
          ? `You have unfollowed ${user.fullname}`
          : `You are now following ${user.fullname}`
      );
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="w-48 text-center bg-gradient-to-br from-[#1f2937] to-[#111827] text-white rounded-2xl shadow-2xl overflow-hidden transition transform hover:scale-105 duration-300">
      <div className="flex flex-col items-center px-6 py-8">

        <Avatar avatarUrl={user.avatarUrl} alt={user.fullname} width='w-20' height='h-20' usedFrame={user.usedFrame}/>
        <h3
          className="mt-4 text-sm font-semibold hover:underline cursor-pointer"
          onClick={() => navigate(`/profile/${user.username}`)}
        >
          {user.fullname}
        </h3>

        <button
          onClick={toggleFollow}
          className={`mt-6 flex items-center justify-center gap-2 w-full py-2 text-sm font-medium rounded-full transition duration-200
          ${isFollow
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
            }`}
        >
          {isFollow ? <LuUserX2 className="text-lg" /> : <FaUserFriends className="text-lg" />}
          {isFollow ? 'Unfollow' : 'Follow'}
        </button>
      </div>
    </div>
  );
};

export default UserInforCard;
