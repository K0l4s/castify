import React, { useEffect, useState } from 'react';
import ProfileMainContent from '../../../components/main/profile/ProfileMainContent';
import MainHeader from '../../../components/header/MainHeader';
import { userService } from '../../../services/UserService';
import { User } from '../../../models/User';
import { Role } from '../../../constants/Role';
import { useToast } from '../../../context/ToastProvider';
import Cookie from 'js-cookie';
import { useParams } from 'react-router-dom';
import { RootState } from '../../../redux/store';
import { useSelector } from 'react-redux';
import NotAccessPage from '../../informationPage/NotAccessPage';
import Loading from '../../../components/UI/custom/Loading';
import NotFoundPage from '../../informationPage/NotFoundPage';
import NotFoundInformation from '../../informationPage/NotFoundInformation';

const ProfilePage: React.FC = () => {
  const  username  = useParams().username;
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
    <div className="min-h-screen bg-gray-900">
      <MainHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ProfileMainContent user={user} />
        </div>
      </div>
      {isLoading && <Loading />}
    </div>
  );
};

export default ProfilePage;
