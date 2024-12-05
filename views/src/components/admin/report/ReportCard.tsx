import { Report } from "../../../models/Report";

interface UserReportProps {
    report: Report;
    onClick?: () => void;
}

const ReportCard: React.FC<UserReportProps> = ({ report, onClick }) => {
    return (
        <div
            className="w-11/12 mx-auto bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden my-4 border border-gray-200 cursor-pointer dark:bg-gray-800 dark:border-gray-700"

        >
            {/* Header */}
            <div className="bg-gray-100 p-4 border-b border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                <h3 className="text-xl font-bold text-gray-800 truncate dark:text-gray-200">{report.title}</h3>
                <p className="text-sm text-gray-600 truncate dark:text-gray-400">{report.detail}</p>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* Type and Status */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">Type:</span> {report.type}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">Status:</span> {report.status}
                        </p>
                    </div>
                </div>

                {/* Handle Methods */}
                {report.handleMethod.length > 0 && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p className="font-semibold">Handle Methods:</p>
                        <p className="text-gray-700 mt-1 dark:text-gray-500">{report.handleMethod.join(", ")}</p>
                    </div>)}
            </div>

            {/* Footer */}
            <div className="bg-gray-100 p-4 text-right dark:bg-gray-700 dark:text-white">
                <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    onClick={onClick}
                >
                    Xử lý
                </button>
            </div>
        </div>
    );
};

export default ReportCard;
