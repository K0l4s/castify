import React, { useEffect, useState } from 'react';
import { User } from '../../../models/User';
import { userService } from '../../../services/UserService';
import { useToast } from '../../../context/ToastProvider';
import Loading from '../../../components/UI/custom/Loading';
import CustomButton from '../../../components/UI/custom/CustomButton';

const SettingPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User>();
  // const [isEdit, setIsEdit] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        const userRes = await userService.getUserDetails();
        if (userRes?.data) {
          setUser(userRes.data);
        } else {
          toast.error("Error loading user details");
        }
      } catch (error) {
        toast.error("Error fetching user details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await userService.updateUser(user!);
      if (response.data) {
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error("Error updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prev => prev ? {...prev, [name]: value} : prev);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Profile Settings</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
              <input
                type="text"
                name="firstName"
                value={user?.firstName || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={user?.lastName || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                name="email"
                value={user?.email || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
              <input
                type="tel"
                name="phone"
                value={user?.phone || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
              <input
                type="text"
                name="address"
                value={user?.address || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <CustomButton
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              Save Changes
            </CustomButton>
          </div>
        </form>
      </div>
      {isLoading && <Loading />}
    </div>
  );
};

export default SettingPage;