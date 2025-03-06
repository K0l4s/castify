import React, { useEffect, useState } from 'react';
import { updateUser, User } from '../../../models/User';
import { userService } from '../../../services/UserService';
import { useToast } from '../../../context/ToastProvider';
import CustomButton from '../../UI/custom/CustomButton';
import CustomInput from '../../UI/custom/CustomInput';
import { BiEditAlt, BiLoader, BiSave } from 'react-icons/bi';
import { GiCancel } from 'react-icons/gi';
import Loading from '../../UI/custom/Loading';
import CustomModal from '../../UI/custom/CustomModal';
import { useDispatch } from 'react-redux';
import { updateAvatar, updateCover } from '../../../redux/slice/authSlice';
import defaultAvatar from '../../../assets/images/default_avatar.jpg';

interface SettingModals {
  isOpen: boolean;
  onClose: () => void;
}
const SettingModals = (props: SettingModals) => {

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User>();
  const [editedUser, setEditedUser] = useState<updateUser>({
    firstName: '',
    middleName: '',
    lastName: '',
    birthday: '',
    addressElements: '',
    ward: '',
    district: '',
    provinces: '',
    phone: ''
  });
  const [isEdit, setIsEdit] = useState(false);
  const toast = useToast();
  const dispatch = useDispatch();

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
            addressElements: userRes.data.addressElements,
            ward: userRes.data.ward,
            district: userRes.data.district,
            provinces: userRes.data.provinces,
            phone: userRes.data.phone
          });
          console.log(editedUser)
        } else {
          toast.error("Error loading user details");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [props.isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log(editedUser);
    try {
      const response = await userService.updateUser(editedUser);
      if (response.data) {
        setUser(prev => prev ? { ...prev, ...editedUser } : prev);
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

    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setEditedUser(prev => ({
      ...prev,
      [name]: new Date(value)
    }));
  };



  const handleCancel = () => {
    if (user) {
      setEditedUser({
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        birthday: user.birthday,
        addressElements: user.addressElements,
        ward: user.ward,
        district: user.district,
        provinces: user.provinces,
        // address: user.address,
        phone: user.phone
      });
    }
    setIsEdit(false);
  };

  const handleChangeAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    toast.loading("Uploading avatar...");
    const file = e.target.files?.[0];
    if (file) {
      await userService.changeAvatar(file).then(res => {
        console.log(res);
        toast.clearAllToasts();
        toast.success("Avatar updated successfully");
        setUser(prev => prev ? { ...prev, avatarUrl: URL.createObjectURL(file) } : prev);
        dispatch(updateAvatar(URL.createObjectURL(file)))
      }
      ).catch(err => {
        console.log(err);
        toast.clearAllToasts();
        toast.error("Error update avatar");
      });
    }
  };

  const handleChangeCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    toast.loading("Uploading cover...");
    const file = e.target.files?.[0];
    if (file) {
      await userService.changeCover(file).then(res => {
        console.log(res);
        toast.clearAllToasts();
        toast.success("Cover updated successfully");
        setUser(prev => prev ? { ...prev, coverUrl: URL.createObjectURL(file) } : prev);
        dispatch(updateCover(URL.createObjectURL(file)))
      }
      ).catch(err => {
        console.log(err);
        toast.clearAllToasts();
        toast.error("Error update cover");
      });
    }
  };



  return (
    <CustomModal title='Setting' isOpen={props.isOpen} onClose={props.onClose} size='xl'>
      <div className=" mx-auto">
        <div className="relative">
          {/* Banner Image */}
          <div className="w-full relative h-48 sm:h-56 md:h-64 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-pink-900/30 mix-blend-overlay dark:mix-blend-multiply"></div>
            {isLoading ? (
              <div className="w-full h-full object-cover object-center transform transition-transform duration-700 ">
                <div className="animate-pulse w-full h-full bg-gray-300 dark:bg-gray-700"></div>
              </div>
            ) : (
              <img
                className="w-full h-full object-cover object-center rounded-xl transform transition-transform duration-700 "
                src={user?.coverUrl || "https://png.pngtree.com/thumb_back/fw800/background/20231005/pngtree-3d-illustration-captivating-podcast-experience-image_13529585.png"}
                alt="Profile Banner"
              />
            )}
          </div>
          <label htmlFor="cover"
            className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <input type="file" id="cover" className="hidden"
              onChange={handleChangeCover}
            />
            <BiEditAlt className="text-white w-8 h-8" />
          </label>
        </div>
        <div className='w-40 h-40 m-auto rounded-full border-solid border-4 border-green-400 relative group overflow-hidden -mt-20'>
          <img
            className='rounded-full object-center object-cover w-full h-full transition-opacity duration-300 group-hover:opacity-80'
            src={user?.avatarUrl ||
              defaultAvatar}
            alt="avatar"
            id='avatarShown'
          />

          {/* Icon BiEditAlt */}
          <label htmlFor="avatar"
            className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <input type="file" id="avatar" className="hidden"
              onChange={handleChangeAvatar}
            />
            <BiEditAlt className="text-white w-8 h-8" />
          </label>
        </div>
        {!isEdit && (
          <div className='flex justify-end'>
            <CustomButton
              type="button"
              isShining={true}
              variant="success"
              onClick={() => setIsEdit(true)}
              className="px-4 py-2 text-sm font-semibold rounded-lg mb-2"
            >
              <BiEditAlt className="w-4 h-4" />
            </CustomButton>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                <CustomInput
                  type="text"
                  name="lastName"
                  value={editedUser.lastName}
                  onChange={handleDateInputChange}
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
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Birthday</label>
              <input
                type="date"
                name="birthday"
                    value={
                      editedUser.birthday
                    }          
                onChange={handleInputChange}
                disabled={!isEdit}
                // className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:border-gray-200 disabled:bg-gray-100 dark:disabled:border-gray-700 dark:disabled bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500 px-4 py-2 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Hamlet</label>
              <CustomInput
                type="text"
                name="addressElements"
                value={editedUser.addressElements}
                onChange={handleInputChange}
                disabled={!isEdit}
                variant="primary"
                className="mt-1 block w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Provinces</label>
                <CustomInput
                  type="text"
                  name="provinces"
                  value={editedUser.provinces}
                  onChange={handleInputChange}
                  disabled={!isEdit}
                  variant="primary"
                  className="mt-1 block w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">District</label>
                <CustomInput
                  type="text"
                  name="district"
                  value={editedUser.district}
                  onChange={handleInputChange}
                  disabled={!isEdit}
                  variant="primary"
                  className="mt-1 block w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Ward</label>
                <CustomInput
                  type="text"
                  name="ward"
                  value={editedUser.ward}
                  onChange={handleInputChange}
                  disabled={!isEdit}
                  variant="primary"
                  className="mt-1 block w-full"
                />
              </div>
            </div>
            <div>
              
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
                {isLoading ? <><BiLoader />Saving...</> : <><BiSave />Save Changes</>}
              </CustomButton>
            </div>
          )}
        </form>
      </div>
      {isLoading && <Loading />}
      {/* </div> */}
    </CustomModal>
  );
};

export default SettingModals;