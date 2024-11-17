import React from 'react';
import { FaMapMarkerAlt, FaUserFriends } from 'react-icons/fa';
import { GiRank3, GiLaurelCrown } from 'react-icons/gi';
import { BsStars } from 'react-icons/bs';
import { User } from '../../../models/User';

interface ProfileMainContentProps {
    user: User;
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

const ProfileMainContent: React.FC<ProfileMainContentProps> = ({
    user,
    frameGradient = "bg-gradient-to-r from-purple-600 via-gold-400 to-pink-600",
    frameBorderWidth = 4,
    frameBorderColor = "border-gray-900",
    badgeIcon = <GiLaurelCrown className="text-white text-xl" />,
    badgeBackground = "bg-yellow-500",
    badgePosition = { top: "-0.25rem", right: "-0.25rem" }
}) => {
    return (
        <div className="w-full">
            {/* Profile Header Section */}
            <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden transform transition-all hover:scale-[1.01] duration-300">
                <div className="relative">
                    {/* Banner Image */}
                    <div className="w-full h-48 sm:h-56 md:h-64 bg-gray-800 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-blue-900/30 mix-blend-overlay"></div>
                        <img 
                            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                            src={user.coverUrl || "https://png.pngtree.com/thumb_back/fw800/background/20231005/pngtree-3d-illustration-captivating-podcast-experience-image_13529585.png"}
                            alt="Profile Banner"
                        />
                    </div>

                    {/* Profile Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent h-32 sm:h-36 md:h-40"/>
                    
                    {/* Profile Content */}
                    <div className="relative px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
                        {/* Profile Picture with Custom Frame */}
                        <div className="absolute -top-16 sm:-top-20 left-4 sm:left-6 md:left-8">
                            <div className="relative group">
                                {/* Animated Border Frame */}
                                <div className={`absolute -inset-1 ${frameGradient} rounded-full animate-spin-slow opacity-75 blur-sm group-hover:opacity-100 transition duration-500`}></div>
                                <div className={`w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full border-${frameBorderWidth} ${frameBorderColor} overflow-hidden relative transform transition-transform duration-300 group-hover:scale-105`}>
                                    <img 
                                        className="w-full h-full object-cover object-center transform transition-transform duration-500 group-hover:scale-110"
                                        src={user.avatarUrl || "https://flowbite.com/docs/images/people/profile-picture-5.jpg"}
                                        alt="Profile Picture"
                                    />
                                    {/* Customizable Badge */}
                                    <div 
                                        className={`absolute ${badgeBackground} p-1.5 sm:p-2 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-12`}
                                        style={{
                                            top: badgePosition.top,
                                            right: badgePosition.right,
                                            bottom: badgePosition.bottom,
                                            left: badgePosition.left
                                        }}
                                    >
                                        {badgeIcon}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Details */}
                        <div className="ml-32 sm:ml-40 md:ml-48 pt-2 sm:pt-3 md:pt-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                        <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight hover:text-blue-400 transition-colors duration-300">
                                            {`${user.lastName} ${user.middleName} ${user.firstName}`}
                                        </h1>
                                        {/* Verification Badge */}
                                        <BsStars className="text-yellow-500 text-xl sm:text-2xl animate-pulse" />
                                        {/* Level Badge */}
                                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full flex items-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                                            <GiRank3 className="mr-1.5" />
                                            Level 50
                                        </span>
                                    </div>
                                    <div className="flex items-center text-gray-300 mt-1 sm:mt-2 hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base">
                                        <FaMapMarkerAlt className="mr-2" />
                                        <span>{user.address || "No address provided"}</span>
                                    </div>
                                </div>
                                <button className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 sm:px-8 py-2 sm:py-2.5 rounded-full transition duration-300 transform hover:scale-105 hover:shadow-lg text-sm sm:text-base w-full sm:w-auto">
                                    <FaUserFriends className="mr-2" />
                                    Follow
                                </button>
                            </div>

                            {/* Stats with Badges */}
                            <div className="flex gap-4 sm:gap-6 md:gap-8 mt-4 sm:mt-5 md:mt-6">
                                <div className="text-center relative group cursor-pointer transform hover:scale-105 transition-transform duration-300">
                                    <div className="text-xl sm:text-2xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">1.2K</div>
                                    <div className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300">Following</div>
                                    <div className="absolute -top-2 -right-2 bg-blue-500 w-3 h-3 sm:w-4 sm:h-4 rounded-full animate-pulse"></div>
                                </div>
                                <div className="text-center relative group cursor-pointer transform hover:scale-105 transition-transform duration-300">
                                    <div className="text-xl sm:text-2xl font-bold text-white group-hover:text-green-400 transition-colors duration-300">3.4K</div>
                                    <div className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300">Followers</div>
                                    <div className="absolute -top-2 -right-2 bg-green-500 w-3 h-3 sm:w-4 sm:h-4 rounded-full animate-pulse"></div>
                                </div>
                                <div className="text-center relative group cursor-pointer transform hover:scale-105 transition-transform duration-300">
                                    <div className="text-xl sm:text-2xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">280</div>
                                    <div className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300">Posts</div>
                                    <div className="absolute -top-2 -right-2 bg-purple-500 w-3 h-3 sm:w-4 sm:h-4 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileMainContent;
