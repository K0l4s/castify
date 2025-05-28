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
import { locationService } from '../../../services/LocationService';

interface SettingModals {
  isOpen: boolean;
  onClose: () => void;
}
const SettingModals = (props: SettingModals) => {
  const [provincesList, setProvincesList] = useState<any[]>([]);
  const [districtsList, setDistrictsList] = useState<any[]>([]);
  const [wardsList, setWardsList] = useState<any[]>([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      const provinces = await locationService.getProvinces();
      setProvincesList(provinces.data);
      // console.log(provincesList);
    };
    fetchProvinces();
  }, []);
  const handleProvincesChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id === "") {
      setDistrictsList([]);
      setWardsList([]);
      return;
    }
    const districts = await locationService.getDistricts(id);
    setDistrictsList(districts.data);
  };
  const handleDistrictsChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id === "") {
      setWardsList([]);
      return;
    }
    const wards = await locationService.getWards(id);
    setWardsList(wards.data);
  }

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User>();
  const [editedUser, setEditedUser] = useState<updateUser>({
    firstName: '',
    middleName: '',
    lastName: '',
    birthday: '',
    addressElements: '',
    wardId: '',
    ward: '',
    district: '',
    provinces: '',
    phone: ''
  });
  const [isEdit, setIsEdit] = useState(false);
  const toast = useToast();
  const dispatch = useDispatch();
  const fetchDistricts = async (id: string) => {
    const districts = await locationService.getDistricts(id);
    setDistrictsList(districts.data);
  };
  const fetchWards = async (id: string) => {
    const wards = await locationService.getWards(id);
    setWardsList(wards.data);
  };
  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      const userRes = await userService.getUserAuth();
      if (userRes?.data) {
        setUser(userRes.data);

        // Format birthday to yyyy-MM-dd for input[type="date"]
        let birthdayValue = '';
        if (userRes.data.birthday) {
          const date = new Date(userRes.data.birthday);
          if (!isNaN(date.getTime())) {
            birthdayValue = date.toISOString().split('T')[0];
          }
        }

        setEditedUser({
          firstName: userRes.data.firstName,
          middleName: userRes.data.middleName,
          lastName: userRes.data.lastName,
          birthday: birthdayValue,
          addressElements: userRes.data.addressElements,
          wardId: userRes.data.location.id,
          ward: userRes.data.ward,
          district: userRes.data.district,
          provinces: userRes.data.provinces,
          phone: userRes.data.phone
        });

        // lấy select provinces và set value
        if (userRes.data.location && userRes.data.location.district && userRes.data.location.district.city) {
          const provincesSelect = document.querySelector('select[name="provinces"]') as HTMLSelectElement;
          if (provincesSelect) {
            provincesSelect.value = userRes.data.location.district.city.id;
          }
          await fetchDistricts(userRes.data.location.district.city.id);
          // lấy select district và set value
          const districtSelect = document.querySelector('select[name="district"]') as HTMLSelectElement;
          if (districtSelect) {
            districtSelect.value = userRes.data.location.district.id;
          }
          await fetchWards(userRes.data.location.district.id);
          // lấy select ward và set value
          const wardSelect = document.querySelector('select[name="ward"]') as HTMLSelectElement;
          if (wardSelect) {
            wardSelect.value = userRes.data.location.id;
          }
        }
      } else {
        toast.error("Error loading user details");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchUserDetails();
    // eslint-disable-next-line
  }, [props.isOpen]);
  const handleWardsChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      wardId: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const selectedWard = document.querySelector('select[name="ward"]') as HTMLSelectElement;
      const location = wardsList.find(ward => ward.id === selectedWard.value);

      // Use birthday from editedUser state, not from DOM
      let birthday = editedUser.birthday;
      const formattedDate = birthday + 'T00:00:00.000'; // ISO-8601 đầy đủ với mili giây


      // Prepare updated user object
      const updatedUser = {
        ...editedUser,
        birthday: formattedDate,
        location: location,
        // location: location // if needed
      };

      const response = await userService.updateUser(updatedUser);
      if (response.data) {
        setUser(prev => prev ? { ...prev, ...updatedUser } : prev);
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

  const handleCancel = () => {
    fetchUserDetails();
    setIsEdit(false);
  };

  const handleChangeAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    toast.loading("Uploading avatar...");
    const file = e.target.files?.[0];
    if (file) {
      await userService.changeAvatar(file).then(res => {
        toast.clearAllToasts();
        toast.success("Avatar updated successfully");
        setUser(prev => prev ? { ...prev, avatarUrl: URL.createObjectURL(file) } : prev);
        dispatch(updateAvatar(URL.createObjectURL(file)))
      }
      ).catch(err => {
        toast.clearAllToasts();
        toast.error("Error update avatar"+err.message);
      });
    }
  };

  const handleChangeCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    toast.loading("Uploading cover...");
    const file = e.target.files?.[0];
    if (file) {
      await userService.changeCover(file).then(res => {
        toast.clearAllToasts();
        toast.success("Cover updated successfully");
        setUser(prev => prev ? { ...prev, coverUrl: URL.createObjectURL(file) } : prev);
        dispatch(updateCover(URL.createObjectURL(file)))
      }
      ).catch(err => {
        toast.clearAllToasts();
        toast.error("Error update cover" + err.message);
      });
    }
  };

  const inputClasses = "mt-1 block w-full px-3 py-2 bg-gray-800/30 border border-gray-700 rounded-md " +
    "focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-500";
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
              <CustomInput
                type="date"
                name="birthday"
                value={editedUser.birthday}
                onChange={isEdit ? handleInputChange : undefined}
                disabled={!isEdit}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Locality</label>
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
                <select
                  id="provinces"
                  name="provinces"
                  onChange={handleProvincesChange}
                  disabled={!isEdit}
                  className={inputClasses}
                  required
                >
                  <option value="">Select Provinces</option>
                  {provincesList.map(province => (
                    <option key={province.id} value={province.id}>{province.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">District</label>
                <select
                  id="district"
                  name="district"
                  onChange={handleDistrictsChange}
                  disabled={!isEdit}
                  className={inputClasses}
                  required
                >
                  <option value="">Select Districts</option>
                  {districtsList.map(district => (
                    <option key={district.id} value={district.id}>{district.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Ward</label>
                <select
                  id="ward"
                  name="ward"
                  onChange={handleWardsChange}
                  disabled={!isEdit}
                  className={inputClasses}
                  required
                >
                  <option value="">Select Ward</option>
                  {wardsList.map(ward => (
                    <option key={ward.id} value={ward.id}>{ward.name}</option>
                  ))}
                </select>
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
    </CustomModal>
  );
};

export default SettingModals;