import { useEffect, useState } from "react";
import { userCard } from "../../../models/User";
import { creatorService } from "../../../services/CreatorService";
import { userService } from "../../../services/UserService";
import { useToast } from "../../../context/ToastProvider";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../../../assets/images/default_avatar.jpg";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { useLanguage } from "../../../context/LanguageContext";

const CreatorFollower = () => {
    const [followers, setFollowers] = useState<userCard[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(0);
    const [pageSize] = useState<number>(10);
    const [totalPage, setTotalPage] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const toast = useToast();
    const { language } = useLanguage();

    useEffect(() => {
        setLoading(true);
        creatorService
            .getFollowers(pageNumber, pageSize)
            .then((res) => {
                setFollowers(res.data.data);
                setTotalPage(res.data.totalPages);
                setTotalElements(res.data.totalElements || res.data.totalPages * pageSize);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Get followers failed");
                setLoading(false);
            });
    }, [pageNumber, pageSize, toast]);

    const handleFollowToggle = async (username: string, userId: string, isCurrentlyFollowing: boolean) => {
        try {
            await userService.followUser(username);
            
            setFollowers((prev) =>
                prev.map((user) => {
                    if (user.id === userId) {
                        const updatedFollowers = isCurrentlyFollowing 
                            ? user.totalFollower - 1 
                            : user.totalFollower + 1;
                        return { 
                            ...user, 
                            follow: !user.follow, 
                            totalFollower: updatedFollowers 
                        };
                    }
                    return user;
                })
            );
            
            toast.success(isCurrentlyFollowing ? "Unfollowed successfully" : "Followed successfully");
            
        } catch (error) {
            console.error("Follow/unfollow failed:", error);
            toast.error("Failed to update follow status");
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPage && !loading) {
            setPageNumber(newPage);
        }
    };

    // Loading state
    if (loading && followers.length === 0) {
        return (
            <div className="p-6 mx-auto min-h-screen rounded-2xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
    <div className="p-6 mx-auto min-h-screen rounded-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-700 dark:text-blue-300 tracking-tight">
            {language.profile.followers}
            <span className="text-lg font-normal text-gray-500 dark:text-gray-400 ml-2">
                ({totalElements} {totalElements === 1 ? 'follower' : 'followers'})
            </span>
        </h1>

        {followers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {followers.map((user) => (
                    <div
                        key={user.id}
                        className="flex flex-col p-4 rounded-xl bg-white/80 dark:bg-gray-800/80 shadow-lg hover:shadow-2xl transition-shadow duration-300 h-64 min-w-0"
                    >
                        <div className="flex justify-center mb-3">
                            <img
                                src={user.avatarUrl || defaultAvatar}
                                alt={`${user.fullname}'s avatar`}
                                className="w-16 h-16 rounded-full object-cover border-4 border-blue-200 dark:border-blue-700 shadow-md cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => navigate("/profile/" + user.username)}
                            />
                        </div>

                        <div className="flex-1 flex flex-col justify-between text-center">
                            {/* User info */}
                            <div className="mb-3">
                                <h2
                                    className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors line-clamp-1"
                                    onClick={() => navigate("/profile/" + user.username)}
                                    title={user.fullname}
                                >
                                    {user.fullname}
                                </h2>
                                <p
                                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 cursor-pointer transition-colors line-clamp-1"
                                    onClick={() => navigate("/profile/" + user.username)}
                                    title={`@${user.username}`}
                                >
                                    @{user.username}
                                </p>
                            </div>
                            
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
                                <div className="text-center">
                                    <div className="font-semibold text-sm">{user.totalFollower}</div>
                                    <div className="truncate">{language.profile.followers}</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-sm">{user.totalFollowing}</div>
                                    <div className="truncate">{language.profile.following}</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-sm">{user.totalPost}</div>
                                    <div className="truncate">{language.profile.posts}</div>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => handleFollowToggle(user.username, user.id, user.follow)}
                                disabled={loading}
                                className={`w-full py-2 px-4 text-sm font-semibold rounded-full shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
                                    ${user.follow
                                        ? "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 focus:ring-red-400"
                                        : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 focus:ring-blue-400"
                                    }`}
                            >
                                {user.follow ? language.profile.unfollow : language.profile.follow}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20">
                <svg width="64" height="64" fill="none" className="mb-4 text-gray-300 dark:text-gray-600" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                    <path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" stroke="currentColor" strokeWidth="2" />
                </svg>
                <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">No followers found.</p>
            </div>
        )}

        {/* Pagination remains the same */}
        {totalPage > 1 && (
            <div className="mt-10 flex justify-center items-center gap-4">
                <button
                    onClick={() => handlePageChange(pageNumber - 1)}
                    className={`p-3 rounded-full bg-white dark:bg-gray-700 shadow hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 transition-all
                        ${pageNumber === 0 || loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={pageNumber === 0 || loading}
                    aria-label="Previous page"
                >
                    <BsArrowLeft size={22} />
                </button>
                
                <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                    {language.profile.page} <span className="font-bold">{pageNumber + 1}</span> {language.profile.of} <span className="font-bold">{totalPage}</span>
                </span>
                
                <button
                    onClick={() => handlePageChange(pageNumber + 1)}
                    className={`p-3 rounded-full bg-white dark:bg-gray-700 shadow hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 transition-all
                        ${pageNumber === totalPage - 1 || loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={pageNumber === totalPage - 1 || loading}
                    aria-label="Next page"
                >
                    <BsArrowRight size={22} />
                </button>
            </div>
        )}
        
        {loading && followers.length > 0 && (
            <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )}
    </div>
);
};

export default CreatorFollower;