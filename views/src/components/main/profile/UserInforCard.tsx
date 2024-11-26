import React from 'react';
import { FaUserFriends } from 'react-icons/fa';

const UserInforCard: React.FC = () => {
  return (
    <div className=" flex flex-col items-center w-full p-4">
      <div className="w-full max-w-sm bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex flex-col items-center">
          <img 
            src="https://via.placeholder.com/150" 
            alt="Profile"
            className="w-20 h-20 rounded-full border-4 border-blue-500 mb-4"
          />
          <h2 className="text-2xl font-bold mb-2">John Wick</h2>
          <p className="text-gray-400 text-sm mb-4">@johnwick</p>

          <div className="flex justify-between w-full mb-6">
            <div className="text-center">
              <div className="font-bold">1.2K</div>
              <div className="text-sm text-gray-400">Following</div>
            </div>
            <div className="text-center">
              <div className="font-bold">3.4K</div>
              <div className="text-sm text-gray-400">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-bold">280</div>
              <div className="text-sm text-gray-400">Posts</div>
            </div>
          </div>

          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center">
            <FaUserFriends className="mr-2" />
            Follow
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInforCard;
