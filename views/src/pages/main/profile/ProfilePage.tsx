import React from 'react';
import ProfileMainContent from '../../../components/main/profile/ProfileMainContent';
import UserInfoSidebar from '../../../components/main/profile/UserInforSidebar';
import MainHeader from '../../../components/header/MainHeader';
import { useTheme } from '../../../context/ThemeContext';

const ProfilePage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <MainHeader />
      <div className="flex min-h-screen bg-gray-900 text-white">
        <div className="w-1/5 p-4 bg-gray-800">
          <UserInfoSidebar />
        </div>

        <div className="w-3/5 p-4 mx-auto">
          <ProfileMainContent />
          <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <button
        onClick={toggleTheme}
        className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg shadow-md"
      >
        {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      </button>
    </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
