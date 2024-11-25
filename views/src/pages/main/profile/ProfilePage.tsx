import React from 'react';
import ProfileMainContent from '../../../components/main/profile/ProfileMainContent';
import { useParams } from 'react-router-dom';
import { RootState } from '../../../redux/store';
import { useSelector } from 'react-redux';
import NotAccessPage from '../../informationPage/NotAccessPage';
import PodcastCard from '../../../components/UI/podcast/PodcastCard';
import CustomButton from '../../../components/UI/custom/CustomButton';

const ProfilePage: React.FC = () => {
  const username = useParams().username;
  


  
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

 
  if (!isAuthenticated && !username) {
    return <NotAccessPage />;
  }

  return (
    <div className="min-h-screen">
     
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto">
          <ProfileMainContent />
          {/* selection*/}
          <div className="flex justify-center gap-4 mb-8 p-2 bg-white dark:bg-gray-800 backdrop-blur-sm rounded-3xl shadow-xl mt-5">
            <CustomButton variant="primary">
              All
            </CustomButton>
            <CustomButton variant="secondary">
              Popular
            </CustomButton>
            <CustomButton variant="secondary">
              Newest
            </CustomButton>
            <CustomButton variant="secondary">
              Oldest
            </CustomButton>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <PodcastCard 
                key={index}
                title="Test"
                user={{
                  avatar: "https://tenten.vn/tin-tuc/wp-content/uploads/2023/08/podcast-la-gi-2.jpg",
                  username: "Test"
                }}
                thumbnailUrl="https://tenten.vn/tin-tuc/wp-content/uploads/2023/08/podcast-la-gi-2.jpg"
                duration="1:23"
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
