import React, { useEffect, useState } from 'react';
import { FaEdit, FaFlag, FaMapMarkerAlt, FaUserCheck, FaUserPlus } from 'react-icons/fa';
import { userDetail } from '../../../models/User';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import CustomButton from '../../UI/custom/CustomButton';
import { userService } from '../../../services/UserService';
import { useToast } from '../../../context/ToastProvider';
import Tooltip from '../../UI/custom/Tooltip';
import SettingModals from '../../modals/user/SettingModal';
import ReportModal from '../../modals/report/ReportModal';
import { ReportType } from '../../../models/Report';
import defaultAvatar from "../../../assets/images/default_avatar.jpg";

interface ProfileMainContentProps {

    frameGradient?: string;
    frameBorderWidth?: number;
    frameBorderColor?: string;
    badgeIcon?: React.ReactNode;
    badgeBackground?: string;
    badgePosition?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
    };
}
const defaultUser = {
    id: "",
    fullname: "",
    username: "",
    avatarUrl: "",
    coverUrl: "",
    birthday: new Date(),
    address: "",
    phone: "",
    email: "",
    badgesId: [],
    follow: false,
    totalFollower: 0,
    totalFollowing: 0,
    totalPost: 0
};
const ProfileMainContent: React.FC<ProfileMainContentProps> = ({
}) => {
    const username = useParams().username;
    const [isLoading, setIsLoading] = useState(true);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const [isOpenEditModel,setIsOpenEditModel] = useState(false);
    const [isOpenReportModel,setIsOpenReportModel] = useState(false);

    const toast = useToast();
    const [user, setUser] = useState<userDetail>(defaultUser);
    useEffect(() => {
        const fetchUserDetails = async () => {
            setIsLoading(true);
            try {
                if (isAuthenticated) {
                    const userRes = username
                        ? await userService.getUserDetails(username)
                        : await userService.getUserDetails();

                    if (userRes?.data) {
                        setUser(userRes.data);
                    } else {
                        setUser(defaultUser);
                        toast.error("User not found");
                    }
                } else {
                    const userRes = await userService.getUserDetails(username);
                    setUser(userRes.data);
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


    const currentUser = useSelector((state: RootState) => state.auth.user);
    const isOwner = !username || currentUser?.username === username;
    const toggleFollow = async () => {
        userService.followUser(username || "").then(() => {
            user.follow = !user.follow;
            if (user.follow) {
                user.totalFollower += 1;
                toast.success("Follow user successfully");
            } else {
                user.totalFollower -= 1;
                toast.success("Unfollow user successfully");
            }
        })
        .catch(() => {
            toast.error("Failed to do this action.");
            return;
        }
        );
        // setIsFollow(!isFollow);
        
    }
    return (
        <div className="w-full">
            {/* Profile Header Section */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 backdrop-blur-lg">
                <div className="relative">
                    {/* Banner Image */}
                    <div className="w-full relative h-48 sm:h-56 md:h-64 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-pink-900/30 mix-blend-overlay dark:mix-blend-multiply"></div>
                        {isLoading ? (
                            <div className="w-full h-full object-cover object-center transform transition-transform duration-700 hover:scale-105">
                                <div className="animate-pulse w-full h-full bg-gray-300 dark:bg-gray-700"></div>
                            </div>
                        ) : (
                            <img
                                className="w-full h-full object-cover object-center transform transition-transform duration-700 hover:scale-105"
                                src={isOwner? currentUser?.coverUrl || "https://png.pngtree.com/thumb_back/fw800/background/20231005/pngtree-3d-illustration-captivating-podcast-experience-image_13529585.png"
                                    : user.coverUrl || "https://png.pngtree.com/thumb_back/fw800/background/20231005/pngtree-3d-illustration-captivating-podcast-experience-image_13529585.png"}
                                alt="Profile Banner"
                            />
                        )}
                        {!isOwner&&(
                        <div className="absolute top-2 right-2 ">
                        <Tooltip text="Report User">
                            <FaFlag 
                            onClick={()=>setIsOpenReportModel(true)}
                            className='m-auto text-2xl
                        text-white dark:text-gray-900
                        cursor:pointer hover:bg-white/20 dark:hover:bg-gray-900/20 transition duration-300 hover:text-yellow-500 dark:hover:text-yellow-500' />
                        </Tooltip>
                    </div>)}

                </div>

                {/* Profile Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white dark:from-gray-900 via-white/95 dark:via-gray-900/95 to-transparent h-32 sm:h-36 md:h-40" />

                {/* Profile Content */}
                <div className="relative px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
                    {/* Profile Picture with Custom Frame */}
                    <div className="absolute -top-16 sm:-top-20 left-4 sm:left-6 md:left-8">
                        <div className="relative group">
                            {/* Animated Border Frame */}
                            <div className={`absolute -inset-1 rounded-full animate-spin-slow opacity-75 blur-sm group-hover:opacity-100 transition duration-500`}></div>
                            <div className={`w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full dark:border-gray-700 overflow-hidden relative transform transition-transform duration-300 group-hover:scale-105 bg-white dark:bg-gray-800`}>
                                {isLoading ? (
                                    <div className="w-full h-full bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
                                ) : (
                                    <img
                                        className="w-full h-full object-cover object-center transform transition-transform duration-500"
                                        src={
                                            isOwner 
                                              ? currentUser?.avatarUrl || defaultAvatar 
                                              : user.avatarUrl || 
                                                defaultAvatar
                                          }                                                                                  
                                        alt="Profile Picture"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = defaultAvatar;
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="ml-32 sm:ml-40 md:ml-48 pt-2 sm:pt-3 md:pt-4">
                        <div className="flex flex-col w-full sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                            <div>
                                <div className="flex w-full items-center gap-4 sm:gap-6">
                                    {isLoading ? (
                                        <div className="w-full h-6 rounded-xl bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
                                    ) : (
                                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-300">
                                            {`${user.fullname}`}
                                        </h1>
                                    )}
                                </div>
                                {isLoading ? (
                                    <div className="w-1/2 h-0 rounded-xl bg-gray-300 dark:bg-gray-700 mt-1 animate-pulse"></div>
                                ) : (
                                    <div className="flex items-center text-gray-600 dark:text-gray-300 mt-1 sm:mt-2 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base">
                                        <FaMapMarkerAlt className="mr-2" />
                                        <span>{user.address || "No address provided"}</span>
                                    </div>
                                )}
                            </div>
                            {isOwner ? (
                                <CustomButton isShining={true} onClick={() => setIsOpenEditModel(true)}>
                                    <FaEdit className="mr-2" />
                                    Edit Profile
                                </CustomButton>
                            ) : (
                                isAuthenticated && (
                                    <>
                                        <CustomButton isShining={true} variant="danger" onClick={toggleFollow}>
                                            {isLoading ? (
                                                <div className="flex items-center gap-1">
                                                    <div className="w-4 h-4 border-4 border-t-transparent border-blue-500 animate-spin rounded-full"></div>
                                                </div>
                                            ) : user.follow ? (
                                                <div className='flex items-center gap-1'>
                                                    <FaUserCheck className="mr-2" />
                                                    Unfollow
                                                </div>
                                            ) : (
                                                <>
                                                    <FaUserPlus className="mr-2" 
                                                    
                                                    />
                                                    Follow
                                                </>
                                            )}

                                        </CustomButton>
                                    </>
                                )
                            )}
                        </div>

                        {/* Stats with Badges */}
                        <div className="flex gap-4 sm:gap-6 md:gap-8 mt-4 sm:mt-5 md:mt-6">
                            {isLoading ? (
                                <div className="w-full h-20 bg-gray-300 dark:bg-gray-700 rounded-3xl animate-pulse"></div>
                            ) : (
                                <>
                                    <div className="text-center relative group cursor-pointer transform transition-transform duration-300">
                                        <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">{user.totalFollowing}</div>
                                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">Following</div>
                                    </div>
                                    <div className="text-center relative group cursor-pointer transform  transition-transform duration-300">
                                        <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors duration-300">{user.totalFollower}</div>
                                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">Followers</div>
                                    </div>
                                    <div className="text-center relative group cursor-pointer transform transition-transform duration-300">
                                        <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors duration-300">{user.totalPost}</div>
                                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">Posts</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <SettingModals isOpen={isOpenEditModel} onClose={()=>setIsOpenEditModel(false)}/>
            <ReportModal isOpen={isOpenReportModel} onClose={()=>setIsOpenReportModel(false)} reportType={ReportType.U} targetId={user.id}/>
        </div >

    );
};

export default ProfileMainContent;
