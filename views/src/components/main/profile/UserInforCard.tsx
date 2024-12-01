import { FaUserFriends } from 'react-icons/fa';
import { userCard } from '../../../models/User';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../../services/UserService';
import { useToast } from '../../../context/ToastProvider';
import { useState } from 'react';
import { LuUserX2 } from 'react-icons/lu';

const UserInforCard = (user: userCard) => {
  const [isFollow, setIsFollow] = useState(user.follow);
  const navigate = useNavigate();
  const toast = useToast();
  const toggleFollow = async () => {
    await userService.followUser(user.username).then(() => {
      // user.follow = !user.follow
      setIsFollow(!isFollow)
      if (isFollow) toast.success("You have successfully unfollowed " + user.fullname)
      else toast.success("You have successfully followed " + user.fullname)
    console.log(user)
    })
      ;
  }
  return (
    <div className=" flex flex-col items-center w-full p-4">
      <div className="w-full max-w-sm bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex flex-col items-center">
          <img
            src={user.avatarUrl ? user.avatarUrl : "https://via.placeholder.com/150"}
            alt="Profile"
            className="w-12 h-12 rounded-full border-4 border-blue-500 mb-4 cursor-pointer"
            onClick={() => navigate(`/profile/${user.username}`)}
          />
          <h2 className="text-xl text-center font-bold mb-2 cursor-pointer" onClick={() => navigate(`/profile/${user.username}`)}>{user.fullname}</h2>
          <p className="text-gray-400 text-sm mb-4 cursor-pointer" onClick={() => navigate(`/profile/${user.username}`)}>@{user.username}</p>

          <div className="flex justify-between w-full mb-6">
            <div className="text-center">
              <div className="font-bold">{user.totalFollowing}</div>
              <div className="text-sm text-gray-400">Following</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{user.totalFollower}</div>
              <div className="text-sm text-gray-400">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{user.totalPost}</div>
              <div className="text-sm text-gray-400">Posts</div>
            </div>
          </div>

          <button onClick={toggleFollow}
            className={`w-full  text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center
            ${isFollow ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}
            `}>
              {isFollow ? <LuUserX2 className="mr-2" /> : <FaUserFriends  className="mr-2" />}
            {isFollow ? "Unfollow" : "Follow"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInforCard;
