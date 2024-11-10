import React from 'react';
import ProfileMainContent from '../../../components/main/profile/ProfileMainContent';
import MainHeader from '../../../components/header/MainHeader';

const ProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <MainHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ProfileMainContent />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
