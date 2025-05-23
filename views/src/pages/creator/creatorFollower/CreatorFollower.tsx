import { useEffect, useState } from "react";
import { userCard } from "../../../models/User";
import { creatorService } from "../../../services/CreatorService";
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
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        creatorService
            .getFollowers(pageNumber, pageSize)
            .then((res) => {
                setFollowers(res.data.data);
                setTotalPage(res.data.totalPages);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Get followers failed");
            });
    }, [pageNumber, pageSize]);

    const handleFollowToggle = (id: string) => {
        // Logic to toggle follow/unfollow and update totalFollowers
        setFollowers((prev) =>
            prev.map((user) => {
                if (user.id === id) {
                    const updatedFollowers = user.follow ? user.totalFollower - 1 : user.totalFollower + 1;
                    return { ...user, follow: !user.follow, totalFollower: updatedFollowers };
                }
                return user;
            })
        );
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPage) {
            setPageNumber(newPage);
        }
    };
    const { language } = useLanguage();
    return (
        <div className="p-5 max-w-full min-h-screen rounded-xl">
            <h1 className="text-2xl font-semibold mb-4 dark:text-gray-300">{language.profile.followers}</h1>
            {followers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 lg:grid-cols-1 gap-4">
                    {followers.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center gap-4 p-4 rounded-lg shadow-xl bg-white dark:bg-gray-700"
                        >
                            <img
                                src={user.avatarUrl || defaultAvatar}
                                alt={`${user.fullname}'s avatar`}
                                className="w-16 h-16 rounded-full object-cover cursor-pointer"
                                onClick={() => navigate("/profile/" + user.username)}
                            />
                            <div className="flex-1">
                                <h2 className="text-lg font-medium text-black dark:text-gray-200 
                                hover:text-gray-800 dark:hover:text-blue-400 cursor-pointer ease-in-out duration-300"
                                    onClick={() => navigate("/profile/" + user.username)}
                                >{user.fullname}</h2>
                                <p className="text-gray-500 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 cursor-pointer ease-in-out duration-300"
                                    onClick={() => navigate("/profile/" + user.username)}
                                >@{user.username}</p>
                                <div className="text-sm text-gray-600 dark:text-gray-200">
                                    <span>{user.totalFollower} Followers</span> •{" "}
                                    <span>{user.totalFollowing} Following</span> •{" "}
                                    <span>{user.totalPost} Posts</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleFollowToggle(user.id)}
                                className={`px-4 py-2 text-sm font-semibold rounded-md ${user.follow
                                    ? "bg-red-500 text-white dark:bg-red-600"
                                    : "bg-blue-500 text-white dark:bg-blue-600"
                                    }`}
                            >
                                {user.follow ? "Unfollow" : "Follow"}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">No followers found.</p>
            )}

            {/* Pagination */}
            <div className="mt-6 flex justify-center items-center gap-2">
                <button
                    onClick={() => handlePageChange(pageNumber - 1)}
                    className={`p-2 bg-gray-200 rounded-full text-gray-700 hover:bg-gray-300 ${pageNumber === 0 && "cursor-not-allowed"}
                    disabled:opacity-50 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500`}
                    disabled={pageNumber === 0}
                >
                    <BsArrowLeft />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {pageNumber + 1} of {totalPage}
                </span>
                <button
                    onClick={() => handlePageChange(pageNumber + 1)}
                    className={`p-2 bg-gray-200 rounded-full text-gray-700 hover:bg-gray-300 
                    ${pageNumber === totalPage - 1 && "cursor-not-allowed"}
                    disabled:opacity-50 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                    `}
                    disabled={pageNumber === totalPage - 1}
                >
                    <BsArrowRight />
                </button>
            </div>
        </div>
    );
};

export default CreatorFollower;
