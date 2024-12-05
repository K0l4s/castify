import { useEffect, useState } from "react";
import { User } from "../../../models/User";
import CustomModal from "../../UI/custom/CustomModal";
import { Podcast } from "../../../models/PodcastModel";
import { Comment } from "../../../models/CommentModel";
import { ProgressList, Report, ReportProgressType, ReportStatus, ReportType } from "../../../models/Report";
import { reportService } from "../../../services/ReportService";
import CustomButton from "../../UI/custom/CustomButton";
import { useToast } from "../../../context/ToastProvider";

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
                .then((res) => setPodcast(res.data)
                )
                .catch((err) => console.log(err));
        } else if (report.type === ReportType.C) {
            reportService.getReportCommentInformation(report.target)
                .then((res) => setComment(res.data))
                .catch((err) => console.log(err));
        }
    }, [report]);
    const handleDeleteReport = () => {
        reportService.declReport(report.id)
            .then((res) => {
                console.log(res);
                report.status = ReportStatus.D;
                onClose();
            })
            .catch((err) => {
                console.log(err);
            });
    };
    const toast = useToast();
    const handleAcceptReport = () => {
        const progressList: ProgressList[] = selectedActions.map((action) => ({
            type: action,
            targetId: report.target,
        }));
        console.log(selectedActions)
        if (progressList.length <= 0) {
            toast.error("Bạn đã xác nhận xử lý, không được bỏ trống!");
            return;
        }
        reportService.acptReport(report.id, progressList)
            .then((res) => {
                console.log(res);
                report.status = ReportStatus.ACP;
                onClose();
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const toggleAction = (action: ReportProgressType) => {
        setSelectedActions((prev) =>
            prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]
        );
    };



    return (
        <CustomModal isOpen={isOpen} onClose={onClose} title="Xử lý báo cáo" size="full" className="dark:bg-gray-800">
            <div className="p-6 space-y-6 bg-gray-50 rounded-lg shadow-md dark:bg-gray-700 dark:text-gray-300">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-4 dark:border-gray-600">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Thông tin báo cáo</h2>
                    <div className="flex items-center space-x-3">
                        <img
                            src={report.userRequest.avatarUrl || "https://via.placeholder.com/40"}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full border dark:border-gray-500"
                        />
                        <p className="text-sm text-gray-700 dark:text-gray-400">Người báo cáo: <strong>{report.userRequest.fullname}</strong></p>
                    </div>
                </div>

                {/* Report Details */}
                <div className="space-y-4">
                    <p className="text-lg dark:text-gray-400">
                        <span className="font-semibold">Tiêu đề:</span> {report.title}
                    </p>
                    <p className="text-lg dark:text-gray-400">
                        <span className="font-semibold">Nội dung:</span> {report.detail}
                    </p>
                    <p className="text-lg dark:text-gray-400">
                        <span className="font-semibold">Loại:</span> {report.type}
                    </p>
                    <p className="text-lg dark:text-gray-400">
                        <span className="font-semibold">Trạng thái:</span> {report.status}
                    </p>
                </div>

                {/* Conditional Sections */}
                {report.type === ReportType.U && user && (
                    <div className="p-4 bg-white rounded-lg shadow border dark:bg-gray-600 dark:text-gray-200">
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">Thông tin người dùng</p>
                        <div className="flex items-center space-x-4 mt-2">
                            <img
                                src={user.avatarUrl || "https://via.placeholder.com/40"}
                                alt="User Avatar"
                                className="w-10 h-10 rounded-full border dark:border-gray-400"
                            />
                            <p className="text-gray-700 dark:text-gray-200">Họ tên: {`${user.lastName} ${user.middleName} ${user.firstName}`}</p>
                        </div>
                        <CustomButton
                            onClick={() => window.open(`/profile/` + user.username, "_blank")}
                            className="mt-4 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded shadow dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                            View Profile
                        </CustomButton>
                    </div>
                )}

                {report.type === ReportType.P && podcast && (
                    <div className="p-4 bg-white rounded-lg shadow border dark:bg-gray-600 dark:text-gray-200">
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">Thông tin podcast</p>
                        <div className="mt-2">
                            <p className="text-gray-700 dark:text-gray-200">
                                <span className="font-medium">Tên:</span> {podcast.title}
                            </p>
                            <p className="text-gray-700 dark:text-gray-200">
                                <span className="font-medium">Mô tả:</span> {podcast.content}
                            </p>
                        </div>
                        <CustomButton
                            onClick={() => window.open(`/watch?pid=${podcast.id}`, "_blank")}
                            className="mt-4 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded shadow dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                            View Podcast
                        </CustomButton>
                    </div>
                )}

                {report.type === ReportType.C && comment && (
                    <div className="p-4 bg-white rounded-lg shadow border dark:bg-gray-600 dark:text-gray-200">
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">Thông tin bình luận</p>
                        <div className="mt-2 space-y-2">
                            <p className="text-gray-700 dark:text-gray-200">
                                <span className="font-medium">Nội dung:</span> {comment.content}
                            </p>
                            <div className="flex items-center space-x-3">
                                <img
                                    src={comment.user.avatarUrl || "https://via.placeholder.com/40"}
                                    alt="Commenter Avatar"
                                    className="w-8 h-8 rounded-full border dark:border-gray-400"
                                />
                                <p className="text-gray-700 dark:text-gray-200">{comment.user.fullname}</p>
                            </div>
                            <p className="text-gray-700 dark:text-gray-200">
                                <span className="font-medium">Thời gian:</span>{" "}
                                {new Date(comment.timestamp).toLocaleString()}
                            </p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {report.status === ReportStatus.P && (
                    <div className="mt-6">
                        <div className="flex justify-between">
                            <button
                                onClick={handleDeleteReport}
                                disabled={isAccept}
                                className={`px-4 py-2 rounded text-white ${isAccept ? "bg-gray-300" : "bg-red-600 hover:bg-red-700"
                                    } dark:bg-red-500 dark:hover:bg-red-600`}
                            >
                                Deny
                            </button>
                            <button
                                onClick={() => setIsAccept(true)}
                                className={`px-4 py-2 rounded text-white ${isAccept ? "bg-gray-300" : "bg-green-600 hover:bg-green-700"
                                    } dark:bg-green-500 dark:hover:bg-green-600`}
                            >
                                Accept
                            </button>
                        </div>

                        {isAccept && (
                            <div className="mt-4 space-y-4">
                                <p className="text-lg font-semibold">Chọn hành động xử lý:</p>
                                <div className="flex flex-wrap gap-4">
                                    {report.type === ReportType.U && (
                                        <CustomButton
                                            onClick={() => toggleAction(ReportProgressType.BU)}
                                            variant={`${selectedActions.includes(ReportProgressType.BU) ? 'danger' : 'ghost'}`}
                                        >
                                            Ban User
                                        </CustomButton>
                                    )}
                                    {report.type === ReportType.C && (
                                        <>
                                            <CustomButton
                                                onClick={() => toggleAction(ReportProgressType.BU)}
                                                variant={`${selectedActions.includes(ReportProgressType.BU) ? 'danger' : 'ghost'}`}
                                            >
                                                Ban User
                                            </CustomButton>
                                            <CustomButton
                                                onClick={() => toggleAction(ReportProgressType.DC)}
                                                variant={`${selectedActions.includes(ReportProgressType.DC) ? 'danger' : 'ghost'}`}
                                            >
                                                Xóa Comment
                                            </CustomButton>
                                        </>
                                    )}
                                    {report.type === ReportType.P && (
                                        <>
                                            <CustomButton
                                                onClick={() => toggleAction(ReportProgressType.BU)}
                                                variant={`${selectedActions.includes(ReportProgressType.BU) ? 'danger' : 'ghost'}`}
                                            >
                                                Ban User
                                            </CustomButton>
                                            <CustomButton
                                                variant={`${selectedActions.includes(ReportProgressType.DP) ? 'danger' : 'ghost'}`}
                                                onClick={()=>toggleAction(ReportProgressType.DP)}
                                            >
                                                Xóa Podcast
                                            </CustomButton>
                                        </>
                                    )}
                                </div>
                                <button
                                    onClick={handleAcceptReport}
                                    className="mt-4 px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded shadow dark:bg-green-500 dark:hover:bg-green-600"
                                >
                                    Save
                                </button>
                            </div>
                        )}
                    </div>
                )}
                {report.status === ReportStatus.ACP && (
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="text-left">Thao tác xử lý</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{report.handleMethod}</td>
                            </tr>
                        </tbody>
                    </table>
                )}
            </div>
        </CustomModal>

    );
};

export default AdminReportModal;
