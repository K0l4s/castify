import React, { useEffect, useState } from 'react';
import ProfileMainContent from '../../../components/main/profile/ProfileMainContent';
import MainHeader from '../../../components/header/MainHeader';
import { userService } from '../../../services/UserService';
import { User } from '../../../models/User';
import { Role } from '../../../constants/Role';
import { useToast } from '../../../context/ToastProvider';
import { useParams } from 'react-router-dom';
import { RootState } from '../../../redux/store';
import { useSelector } from 'react-redux';
import NotAccessPage from '../../informationPage/NotAccessPage';
import Loading from '../../../components/UI/custom/Loading';
import PodcastCard from '../../../components/UI/podcast/PodcastCard';
import CustomButton from '../../../components/UI/custom/CustomButton';

const ProfilePage: React.FC = () => {
  const username = useParams().username;
  const [isLoading, setIsLoading] = useState(true);
  const defaultUser = {
    id: "",
    firstName: "",
    middleName: "",
    lastName: "",
    avatarUrl: "",
    coverUrl: "",
    email: "",
    password: "",
    birthday: new Date(),
    address: "",
    phone: "",
    code: "",
    createDay: new Date(),
    isActive: false,
    isLock: false,
    nickName: "",
    role: Role.U
  };

  const [user, setUser] = useState<User>(defaultUser);
  const toast = useToast();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        let userRes;
        if (username) {
          userRes = await userService.getUserDetails(username);
        } else if (isAuthenticated) {
          userRes = await userService.getUserDetails();
        }

        if (userRes?.data) {
          setUser(userRes.data);
        } else {
          setUser(defaultUser);
          toast.error("User not found");
        }
      } catch (error) {
        setUser(defaultUser);
        toast.error("Error fetching user details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [username, isAuthenticated]);

  if (!isAuthenticated && !username) {
    return <NotAccessPage />;
  }

  return (
    <div className="min-h-screen">
     
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto">
          <ProfileMainContent user={user} />
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
      {isLoading && <Loading />}
    </div>
  );
};

export default ProfilePage;
