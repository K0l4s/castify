import React from 'react';

const UserInfoSidebar: React.FC = () => {
  return (
    <div className="fixed flex flex-col items-center">
      <div className=''>
        <div className="w-24 h-24 rounded-full bg-gray-600 mb-4"></div>
        <p className="text-center font-semibold">John Wick</p>
        <p className="text-center text-gray-400">Location: Unknown</p>
        {/* Add more user information as needed */}
        <button className="mt-4 bg-blue-500 px-4 py-2 rounded">Follow</button>
      </div>
    </div>
  );
};

export default UserInfoSidebar;
