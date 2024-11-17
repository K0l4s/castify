import React, { useEffect, useState } from 'react';
import ProfileMainContent from '../../../components/main/profile/ProfileMainContent';
import MainHeader from '../../../components/header/MainHeader';
import { userService } from '../../../services/UserService';
import { User } from '../../../models/User';
import { Role } from '../../../constants/Role';
import { useToast } from '../../../context/ToastProvider';

const ProfilePage: React.FC = () => {
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
  }
  const [user, setUser] = useState<User>(
    defaultUser
  );
  const toast  = useToast();
  const getUserDetails = async () => {
    return await userService.getUserDetails();
  }
  useEffect(() => {
    const fetchUserDetails = async () => {
      const userRes = await getUserDetails();
      if(userRes?.data) {
        setUser(userRes.data);
      } else {
        setUser(defaultUser);
        toast.error("User not found");
      }
    }
    fetchUserDetails();
  }, []);
  return (
    <div className="min-h-screen bg-gray-900">
      <MainHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ProfileMainContent user={user} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
