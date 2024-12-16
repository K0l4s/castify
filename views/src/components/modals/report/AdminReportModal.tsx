import { useEffect, useRef, useState } from "react";
import { User } from "../../../models/User";
import CustomModal from "../../UI/custom/CustomModal";
import { Podcast } from "../../../models/PodcastModel";
import { Comment } from "../../../models/CommentModel";
import { ProgressList, Report, ReportProgressType, ReportStatus, ReportType } from "../../../models/Report";
import { reportService } from "../../../services/ReportService";
import CustomButton from "../../UI/custom/CustomButton";
import { useToast } from "../../../context/ToastProvider";
import defaultAvatar from "../../../assets/images/default_avatar.jpg";
import CustomPodcastVideo from "../../UI/podcast/CustomPodcastVideo";
import { incrementPodcastViews } from "../../../services/PodcastService";
import { setupVideoViewTracking } from "../../UI/podcast/video";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: Report;
}

const AdminReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, report }) => {
    const [user, setUser] = useState<User | null>(null);
    const [podcast, setPodcast] = useState<Podcast | null>(null);
    const [comment, setComment] = useState<Comment | null>(null);
    const [selectedActions, setSelectedActions] = useState<ReportProgressType[]>([]);
    const [isAccept, setIsAccept] = useState(false);
    const toast = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        setIsAccept(false)
        setComment(null)
        setUser(null);
        setPodcast(null)
        setSelectedActions([])
        if (report.type === ReportType.U) {
            reportService.getReportUserInformation(report.target)
                .then((res) => setUser(res.data))
                .catch((err) => console.log(err));
        } else if (report.type === ReportType.P) {
            reportService.getReportPodcastInformation(report.target)
                .then((res) => {
                    setPodcast({
                        ...res.data,
                        videoUrl: `http://localhost:8081/api/v1/podcast/video?path=${encodeURIComponent(res.data.videoUrl)}`
                    });
                })
                .catch((err) => console.log(err));
        } else if (report.type === ReportType.C) {
            reportService.getReportCommentInformation(report.target)
                .then((res) => setComment(res.data))
                .catch((err) => console.log(err));
        }
    }, [report]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.src = podcast?.videoUrl || "";
            console.log(podcast?.videoUrl)
            videoRef.current.load();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [podcast]);

    const handleDeleteReport = () => {
        reportService.declReport(report.id)
            .then(() => {
                report.status = ReportStatus.D;
                onClose();
                toast.success("Report denied successfully");
            })
            .catch(() => {
                toast.error("Failed to deny report");
            });
    };

    const handleAcceptReport = () => {
        const progressList: ProgressList[] = selectedActions.map((action) => {
            let targetId;

            if (action === 'BAN_USER') {
                switch (report.type) {
                    case ReportType.U:
                        targetId = report.target;
                        break;
                    case ReportType.C:
                        targetId = comment?.user?.id || report.target;
                        break;
                    case ReportType.P:
                        targetId = podcast?.user?.id || report.target;
                        break;
                    default:
                        targetId = report.target;
                        break;
                }
            } else {
                targetId = report.target;
            }

            return {
                type: action,
                targetId,
            };
        });

        if (progressList.length <= 0) {
            toast.error("Please select at least one action");
            return;
        }

        reportService.acptReport(report.id, progressList)
            .then(() => {
                report.status = ReportStatus.ACP;
                onClose();
                toast.success("Report handled successfully");
            })
            .catch(() => {
                toast.error("Failed to handle report");
            });
    };

    const toggleAction = (action: ReportProgressType) => {
        setSelectedActions((prev) =>
            prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]
        );
    };
    // increment podcast views
    const id = podcast?.id;
    const isAuthenticated = true;
    useEffect(() => {
        if (videoRef.current) {
            const cleanup = setupVideoViewTracking(videoRef.current, incrementPodcastViews, id!);
            console.log("cleanup", cleanup)
            return cleanup;
        }
    }, [id, isAuthenticated, podcast]);
    return (
        <CustomModal isOpen={isOpen} onClose={onClose} title="Report Management" size="full" className="dark:bg-gray-800" animation="zoom">
            <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm">
                    <div className="mb-4 md:mb-0">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 tracking-tight">Report Details</h2>
                        <div className="flex items-center mt-3 space-x-3">
                            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm transition-colors duration-200
                                ${report.status === ReportStatus.P
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 ring-1 ring-yellow-400/30'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 ring-1 ring-green-400/30'
                                }`}>
                                {report.status}
                            </span>
                            <span className="px-4 py-1.5 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 rounded-full text-sm font-semibold shadow-sm ring-1 ring-blue-400/30">
                                {report.type}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-600 dark:to-gray-700 p-4 rounded-xl shadow-inner">
                        <div className="relative">
                            <img
                                src={report.userRequest.avatarUrl || defaultAvatar}
                                alt="Reporter"
                                className="w-14 h-14 rounded-full ring-2 ring-blue-500/50 dark:ring-blue-400/50 shadow-md transition-transform hover:scale-105"
                            />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white dark:border-gray-700 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Reported by</p>
                            <p className="font-bold text-gray-800 dark:text-gray-200">{report.userRequest.fullname}</p>
                            {/* view profile */}
                            <CustomButton
                                onClick={() => window.open(`/profile/${report.userRequest.username}`, "_blank")}
                                className="px-6 py-2 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                                text="View Profile"

                            />
                        </div>
                    </div>

                </div>

                {/* Report Content */}
                <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z" clipRule="evenodd" />
                            </svg>
                            Title
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-600 p-4 rounded-lg shadow-inner">{report.title}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Description
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-600 p-4 rounded-lg shadow-inner whitespace-pre-wrap">{report.detail}</p>
                    </div>
                </div>

                {/* User Information Section */}
                {report.type === ReportType.U && user && (
                    <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm transform transition-all duration-300 hover:shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            User Information
                        </h3>
                        <div className="flex items-center space-x-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-600 dark:to-gray-700 p-4 rounded-xl shadow-inner">
                            <img
                                src={user.avatarUrl || defaultAvatar}
                                alt="User"
                                className="w-20 h-20 rounded-full ring-4 ring-gray-200 dark:ring-gray-500 shadow-md transition-transform hover:scale-105"
                            />
                            <div className="space-y-3">
                                <p className="text-xl font-medium text-gray-800 dark:text-gray-200">
                                    {`${user.lastName} ${user.middleName} ${user.firstName}`}
                                </p>
                                <CustomButton
                                    onClick={() => window.open(`/profile/${user.username}`, "_blank")}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    View Profile
                                </CustomButton>
                            </div>
                        </div>
                    </div>
                )}

                {/* Podcast Information Section */}
                {report.type === ReportType.P && podcast && (
                    <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm transform transition-all duration-300 hover:shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            Podcast Information
                        </h3>
                        <div className="space-y-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-600 dark:to-gray-700 p-4 rounded-xl shadow-inner">
                            <div>
                                <h4 className="font-medium text-gray-600 dark:text-gray-300">Title</h4>
                                <p className="text-lg text-gray-800 dark:text-gray-200 mt-1">{podcast.title}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-600 dark:text-gray-300">Description</h4>
                                <p className="text-gray-800 dark:text-gray-200 mt-1">{podcast.content}</p>
                            </div>
                            {/* <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg">
                                <video
                                    src={podcast.videoUrl}
                                    controls
                                    className="w-full h-full object-cover"
                                    poster={podcast.thumbnailUrl || ""}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div> */}
                            <CustomPodcastVideo videoRef={videoRef} videoSrc={podcast.videoUrl} posterSrc={podcast.thumbnailUrl || "/TEST.png"} />
                            <CustomButton
                                onClick={() => window.open(`/watch?pid=${podcast.id}`, "_blank")}
                                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 font-semibold transform hover:-translate-y-0.5"
                            >
                                Watch Full Podcast
                            </CustomButton>
                        </div>
                    </div>
                )}

                {/* Comment Information Section */}
                {report.type === ReportType.C && comment && (
                    <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm transform transition-all duration-300 hover:shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            Comment Information
                        </h3>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-600 dark:to-gray-700 p-4 rounded-xl shadow-inner space-y-4">
                            <div className="flex items-center space-x-4">
                                <img
                                    src={comment.user.avatarUrl || defaultAvatar}
                                    alt="Commenter"
                                    className="w-14 h-14 rounded-full ring-2 ring-gray-200 dark:ring-gray-500 shadow-md transition-transform hover:scale-105"
                                />
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">{comment.user.fullname}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(comment.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
                                <p className="text-gray-800 dark:text-gray-200">{comment.content}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Section */}
                {report.status === ReportStatus.P ? (
                    <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm space-y-6">
                        <div className="flex justify-between gap-4">
                            <button
                                onClick={handleDeleteReport}
                                disabled={isAccept}
                                className={`flex-1 px-6 py-3 rounded-xl text-white font-medium transition-all duration-300 transform hover:-translate-y-0.5 ${isAccept
                                    ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                                    : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg"
                                    }`}
                            >
                                <span className="flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Deny Report
                                </span>
                            </button>
                            <button
                                onClick={() => setIsAccept(true)}
                                disabled={isAccept}
                                className={`flex-1 px-6 py-3 rounded-xl text-white font-medium transition-all duration-300 transform hover:-translate-y-0.5 ${isAccept
                                    ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                                    : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg"
                                    }`}
                            >
                                <span className="flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Accept Report
                                </span>
                            </button>
                        </div>

                        {isAccept && (
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-600 dark:to-gray-700 p-6 rounded-xl shadow-inner">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                    </svg>
                                    Select Actions
                                </h3>
                                <div className="flex flex-wrap gap-4 mb-6">
                                    {report.type === ReportType.U && (
                                        <CustomButton
                                            onClick={() => toggleAction(ReportProgressType.BU)}
                                            variant={selectedActions.includes(ReportProgressType.BU) ? 'danger' : 'ghost'}
                                            className="px-6 py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
                                        >
                                            <span className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                                </svg>
                                                Ban User
                                            </span>
                                        </CustomButton>
                                    )}
                                    {report.type === ReportType.C && (
                                        <>
                                            <CustomButton
                                                onClick={() => toggleAction(ReportProgressType.BU)}
                                                variant={selectedActions.includes(ReportProgressType.BU) ? 'danger' : 'ghost'}
                                                className="px-6 py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
                                            >
                                                <span className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                                    </svg>
                                                    Ban User
                                                </span>
                                            </CustomButton>
                                            <CustomButton
                                                onClick={() => toggleAction(ReportProgressType.DC)}
                                                variant={selectedActions.includes(ReportProgressType.DC) ? 'danger' : 'ghost'}
                                                className="px-6 py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
                                            >
                                                <span className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    Delete Comment
                                                </span>
                                            </CustomButton>
                                        </>
                                    )}
                                    {report.type === ReportType.P && (
                                        <>
                                            <CustomButton
                                                onClick={() => toggleAction(ReportProgressType.BU)}
                                                variant={selectedActions.includes(ReportProgressType.BU) ? 'danger' : 'ghost'}
                                                className="px-6 py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
                                            >
                                                <span className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                                    </svg>
                                                    Ban User
                                                </span>
                                            </CustomButton>
                                            <CustomButton
                                                onClick={() => toggleAction(ReportProgressType.DP)}
                                                variant={selectedActions.includes(ReportProgressType.DP) ? 'danger' : 'ghost'}
                                                className="px-6 py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
                                            >
                                                <span className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    Delete Podcast
                                                </span>
                                            </CustomButton>
                                        </>
                                    )}
                                </div>
                                <button
                                    onClick={handleAcceptReport}
                                    className="w-full px-6 py-3 text-white font-medium bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                                >
                                    <span className="flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Confirm Actions
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                ) :
                    report.userResponse && (
                        <div className="flex items-center space-x-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-600 dark:to-gray-700 p-4 rounded-xl shadow-inner">
                            <div className="relative">
                                <img
                                    src={report.userResponse.avatarUrl ? report.userResponse.avatarUrl : defaultAvatar}
                                    alt="Response"
                                    className="w-14 h-14 rounded-full ring-2 ring-blue-500/50 dark:ring-blue-400/50 shadow-md transition-transform hover:scale-105"
                                />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white dark:border-gray-700 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">User response</p>
                                <p className="font-bold text-gray-800 dark:text-gray-200">{report.userResponse.fullname}</p>
                                <CustomButton
                                    onClick={() => window.open(`/profile/${report.userResponse.username}`, "_blank")}
                                    className="px-6 py-2 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                                    text="View Profile"
                                />
                            </div>
                        </div>
                    )}

                {/* Handled Actions Section */}
                {report.status === ReportStatus.ACP && (
                    <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm transform transition-all duration-300 hover:shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Handled Actions
                        </h3>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-600 dark:to-gray-700 p-4 rounded-xl shadow-inner">
                            <p className="text-gray-800 dark:text-gray-200">{report.handleMethod}</p>
                        </div>
                    </div>
                )}
            </div>
        </CustomModal>
    );
};

export default AdminReportModal;