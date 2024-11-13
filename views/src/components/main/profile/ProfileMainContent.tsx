import React from 'react';
import { FaMapMarkerAlt, FaUserFriends } from 'react-icons/fa';
import { GiRank3, GiLaurelCrown } from 'react-icons/gi';
import { BsStars } from 'react-icons/bs';

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

const ProfileMainContent: React.FC<ProfileMainContentProps> = ({
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
            <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden">
                <div className="relative">
                    {/* Banner Image */}
                    <div className="w-full h-64 bg-gray-800">
                        <img 
                            className="w-full h-full object-cover object-center"
                            src="https://static.vecteezy.com/system/resources/previews/007/059/744/non_2x/live-streaming-podcast-banner-template-vector.jpg"
                            alt="Profile Banner"
                        />
                    </div>

                    {/* Profile Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent h-32"/>
                    
                    {/* Profile Content */}
                    <div className="relative px-6 pb-6">
                        {/* Profile Picture with Custom Frame */}
                        <div className="absolute -top-16 left-6">
                            <div className="relative">
                                {/* Animated Border Frame */}
                                <div className={`absolute -inset-1 ${frameGradient} rounded-full animate-spin-slow opacity-75 blur`}></div>
                                <div className={`w-32 h-32 rounded-full border-${frameBorderWidth} ${frameBorderColor} overflow-hidden relative`}>
                                    <img 
                                        className="w-full h-full object-cover object-center"
                                        src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                                        alt="Profile Picture"
                                    />
                                    {/* Customizable Badge */}
                                    <div 
                                        className={`absolute ${badgeBackground} p-1 rounded-full`}
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
                        <div className="ml-44 pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-bold text-white">John Wick</h1>
                                        {/* Verification Badge */}
                                        <BsStars className="text-yellow-500 text-xl" />
                                        {/* Level Badge */}
                                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                                            <GiRank3 className="mr-1" />
                                            Level 50
                                        </span>
                                    </div>
                                    <div className="flex items-center text-gray-400 mt-1">
                                        <FaMapMarkerAlt className="mr-2" />
                                        <span>Continental Hotel, New York</span>
                                    </div>
                                </div>
                                <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition duration-200">
                                    <FaUserFriends className="mr-2" />
                                    Follow
                                </button>
                            </div>

                            {/* Stats with Badges */}
                            <div className="flex gap-6 mt-4">
                                <div className="text-center relative">
                                    <div className="text-xl font-bold text-white">1.2K</div>
                                    <div className="text-sm text-gray-400">Following</div>
                                    <div className="absolute -top-2 -right-2 bg-blue-500 w-4 h-4 rounded-full"></div>
                                </div>
                                <div className="text-center relative">
                                    <div className="text-xl font-bold text-white">3.4K</div>
                                    <div className="text-sm text-gray-400">Followers</div>
                                    <div className="absolute -top-2 -right-2 bg-green-500 w-4 h-4 rounded-full"></div>
                                </div>
                                <div className="text-center relative">
                                    <div className="text-xl font-bold text-white">280</div>
                                    <div className="text-sm text-gray-400">Posts</div>
                                    <div className="absolute -top-2 -right-2 bg-purple-500 w-4 h-4 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="mt-6 grid grid-cols-1 gap-6">
                {/* <Podcast 
                    videoSrc=""
                    avatarSrc="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                    title="Latest Podcast"
                    author="John Wick"
                    voteCount={1234}
                    dislikeCount={56}
                    commentCount={78}
                    shareCount={90}
                    description="Check out my latest podcast episode!"
                /> */}
            </div>
        </div>
    );
};

export default ProfileMainContent;
