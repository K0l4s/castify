import { Report } from "../../../models/Report";

interface UserReportProps {
    report: Report;
    onClick?: () => void;
}

const ReportCard: React.FC<UserReportProps> = ({ report, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer p-4"
        >
            {/* Header */}
            <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{report.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{report.detail}</p>
            </div>

            {/* Status and Type */}
            <div className="flex gap-4 mb-4">
                <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">Type:</span>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                        {report.type}
                    </span>
                </div>
                <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">Status:</span>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm rounded-full">
                        {report.status}
                    </span>
                </div>
            </div>

            {/* Handle Methods */}
            {report.handleMethod.length > 0 && (
                <div className="mb-4">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Handle Methods:</span>
                    <div className="flex flex-wrap gap-2">
                        {report.handleMethod.map((method, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                            >
                                {method}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Button */}
            <div className="flex justify-end">
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200">
                    Xử lý
                </button>
            </div>
        </div>
    );
};

export default ReportCard;
