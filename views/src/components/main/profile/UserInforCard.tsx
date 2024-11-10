import React from 'react';
import { FaMapMarkerAlt, FaUserFriends, FaRegCalendarAlt } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

const UserInforCard: React.FC = () => {
  return (
    <div className="fixed flex flex-col items-center w-full p-4">
      <div className="w-full max-w-sm bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex flex-col items-center">
          <img 
            src="https://via.placeholder.com/150" 
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-blue-500 mb-4"
          />
          <h2 className="text-2xl font-bold mb-2">John Wick</h2>
          <p className="text-gray-400 text-sm mb-4">@johnwick</p>
          
          <div className="w-full space-y-3 mb-6">
            <div className="flex items-center text-gray-300">
              <FaMapMarkerAlt className="mr-2" />
              <span>New York, USA</span>
            </div>
            <div className="flex items-center text-gray-300">
              <MdEmail className="mr-2" />
              <span>john.wick@email.com</span>
            </div>
            <div className="flex items-center text-gray-300">
              <FaRegCalendarAlt className="mr-2" />
              <span>Joined January 2023</span>
            </div>
          </div>

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
