import React, { useEffect, useState } from 'react';
import { updateUser, User } from '../../../models/User';
import { userService } from '../../../services/UserService';
import { useToast } from '../../../context/ToastProvider';
import Loading from '../../../components/UI/custom/Loading';
import CustomButton from '../../../components/UI/custom/CustomButton';
import CustomInput from '../../../components/UI/custom/CustomInput';
import { BiEditAlt, BiLoader, BiSave } from 'react-icons/bi';
import { GiCancel } from 'react-icons/gi';

const SettingPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User>();
  const [editedUser, setEditedUser] = useState<updateUser>({
    firstName: '',
    middleName: '',
    lastName: '',
    birthday: new Date(),
    address: '',
    phone: ''
  });
  const [isEdit, setIsEdit] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        const userRes = await userService.getUserAuth();
        console.log(userRes);
        if (userRes?.data) {
          setUser(userRes.data);
          setEditedUser({
            firstName: userRes.data.firstName,
            middleName: userRes.data.middleName,
            lastName: userRes.data.lastName,
            birthday: userRes.data.birthday,
            address: userRes.data.address,
            phone: userRes.data.phone
          });
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
      const response = await userService.updateUser(editedUser);
      if (response.data) {
        setUser(prev => prev ? {...prev, ...editedUser} : prev);
        setIsEdit(false);
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
    setEditedUser(prev => ({...prev, [name]: value}));
  };

  const handleCancel = () => {
    if (user) {
      setEditedUser({
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        birthday: user.birthday,
        address: user.address,
        phone: user.phone
      });
    }
    setIsEdit(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Profile Settings</h2>
          {!isEdit && (
            <CustomButton
              type="button"
              isShining={true}
              variant="success"
              onClick={() => setIsEdit(true)}
              className="px-4 py-2 text-sm font-semibold rounded-lg"
            >
              <BiEditAlt className="w-4 h-4" /> Edit Profile
            </CustomButton>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                <CustomInput
                  type="text"
                  name="firstName"
                  value={editedUser.firstName}
                  onChange={handleInputChange}
                  disabled={!isEdit}
                  variant="primary"
                  className="mt-1 block w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Middle Name</label>
                <CustomInput
                  type="text"
                  name="middleName"
                  value={editedUser.middleName}
                  onChange={handleInputChange}
                  disabled={!isEdit}
                  variant="primary"
                  className="mt-1 block w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                <CustomInput
                  type="text"
                  name="lastName"
                  value={editedUser.lastName}
                  onChange={handleInputChange}
                  disabled={!isEdit}
                  variant="primary"
                  className="mt-1 block w-full"
                />
              </div>
            </div>


            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <CustomInput
                type="tel"
                name="phone"
                value={editedUser.phone}
                onChange={handleInputChange}
                disabled={!isEdit}
                variant="primary"
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <CustomInput
                type="text"
                name="address"
                value={editedUser.address}
                onChange={handleInputChange}
                disabled={!isEdit}
                variant="primary"
                className="mt-1 block w-full"
              />
            </div>
          </div>

          {isEdit && (
            <div className="mt-8 flex justify-center space-x-4">
              <CustomButton
                type="button"
                variant="danger"
                onClick={handleCancel}
                className="px-8 py-3 text-lg font-semibold rounded-lg"
                disabled={isLoading}
              >
                <GiCancel className="w-4 h-4" /> Cancel
              </CustomButton>
              <CustomButton
                type="submit"
                variant="success"
                className="px-8 py-3 text-lg font-semibold rounded-lg transform hover:scale-105 transition duration-200"
                disabled={isLoading}
              >
                {isLoading ? <><BiLoader/>Saving...</> : <><BiSave/>Save Changes</>}
              </CustomButton>
            </div>
          )}
        </form>
      </div>
      {isLoading && <Loading />}
    </div>
  );
};

export default SettingPage;