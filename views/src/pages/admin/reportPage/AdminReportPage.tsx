import { useEffect, useState } from "react";
import { Report, ReportStatus, ReportType } from "../../../models/Report";
import { reportService } from "../../../services/ReportService";
import { BiLeftArrow, BiRightArrow } from "react-icons/bi";
import Loading from "../../../components/UI/custom/Loading";
import CustomButton from "../../../components/UI/custom/CustomButton";
import ReportCard from "../../../components/admin/report/ReportCard";
import AdminReportModal from "../../../components/modals/report/AdminReportModal";
const initReport: Report = {
    id: '',
    title: '',
    detail: '',
    type: ReportType.A,
    createdDay: new Date(),
    target: '',
    status: ReportStatus.P,
    userRequest: {
        id: '',
        fullname: '',
        avatarUrl: '',
        username: ''
    },
    userResponse: {
        id: '',
        fullname: '',
        avatarUrl: '',
        username: ''
    },
    handleMethod: []
}
const AdminReportPage = () => {
    const [selectedType, setSelectedType] = useState<ReportType>(ReportType.A);
    const [selectedStatus, setSelectedStatus] = useState<ReportStatus>(ReportStatus.P);
    const [pageNumber, setPageNumber] = useState<number>(0);
    const [pageSize] = useState<number>(5);
    const [reports, setReports] = useState<Report[]>([]);
    const [totalPage, setTotalPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [keyword, setKeyword] = useState<string>('');
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
    const [selectedReport, setSelectedReport] = useState<Report>(
        initReport
    );


    useEffect(() => {
        setLoading(true);
        reportService.getReports(pageNumber, pageSize, selectedStatus, selectedType).then(res => {
            setReports(res.data.data);
            setTotalPage(res.data.totalPages);
            console.log(res.data.totalPages)
            setLoading(false);
            console.log(res);
        }).catch(err => {
            console.log(err);
            setLoading(false);
        });
    }, [pageNumber, pageSize, selectedStatus, selectedType]);

    // Define status and type options
    const statusOptions = [
        { label: "Tất cả", value: ReportStatus.a },
        { label: "Đang chờ", value: ReportStatus.P },
        { label: "Đã chấp nhận", value: ReportStatus.ACP },
        { label: "Đã từ chối", value: ReportStatus.D },
    ];

    // const typeOptions = Object.values(ReportType);
    const typeOptions = [
        { label: "Tất cả", value: ReportType.A },
        { label: "Người dùng", value: ReportType.U },
        { label: "Podcast", value: ReportType.P },
        { label: "Bình luận", value: ReportType.C },
    ]
    const handleSearch = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
          try {
            // setLoading(true); // Uncomment nếu cần hiển thị trạng thái loading
            console.log("Searching for:", keyword);
      
            // Thay thế bằng API của bạn
            const response = await reportService.getReports(
              pageNumber - 1,
              pageSize,
              selectedStatus,
              selectedType,
              keyword
            );
      
            setReports(response.data.data);
            setTotalPage(response.data.totalPage);
            // setLoading(false); // Uncomment nếu cần
          } catch (error) {
            console.error("Error fetching reports:", error);
            // setLoading(false); // Uncomment nếu cần
          }
        }
      };
    // xóa những podcast đã xử lý
    // useEffect(() => {
    //     const status = selectedReport.status;
    //     if (status === ReportStatus.ACP || status === ReportStatus.D) {
    //         const newReports = reports.filter(report => report.id !== selectedReport.id);
    //         setReports(newReports);
    //         console.log(newReports)
    //     }
    // }, [selectedReport, reports]);
    const onModalClose = () => {
        setIsOpenModal(false);
        const status = selectedReport.status;
        if (status === ReportStatus.ACP || status === ReportStatus.D) {
                    const newReports = reports.filter(report => report.id !== selectedReport.id);
                    setReports(newReports);
                    console.log(newReports)
                }
    }
    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Status and Type Filters */}
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Status Filter */}
                <div className="flex flex-wrap justify-center items-center gap-2 py-3 px-4 bg-gray-300 dark:bg-gray-800 rounded-full">
                    {statusOptions.map((status) => (
                        <CustomButton
                            key={status.value}
                            variant={`${selectedStatus === status.value ? 'danger' : 'ghost'}`}
                            className="px-3 py-1.5 text-sm md:text-base md:px-4 md:py-2 rounded-md transition-all duration-200"
                            onClick={() => setSelectedStatus(status.value)}
                        >
                            {status.label}
                        </CustomButton>
                    ))}
                </div>

                {/* Type Filter */}
                <div className="flex flex-wrap justify-center items-center gap-2 py-3 px-4 bg-gray-300 dark:bg-gray-800 rounded-full">
                    {typeOptions.map((type) => (
                        <CustomButton
                            key={type.value}
                            variant={`${selectedType === type.value ? 'danger' : 'ghost'}`}
                            className="px-3 py-1.5 text-sm md:text-base md:px-4 md:py-2 rounded-md transition-all duration-200"
                            onClick={() => setSelectedType(type.value)}
                        >
                            {type.label}
                        </CustomButton>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative max-w-xl mx-auto">
                    <div className="flex items-center px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-800 transition-all duration-200 bg-white/5 backdrop-blur-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192.904 192.904" width="18" className="flex-shrink-0 fill-gray-600 dark:fill-gray-400 mr-3 transition-colors duration-200">
                            <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"></path>
                        </svg>
                        <input
                            type="search"
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={handleSearch}
                            value={keyword}
                            placeholder="Search for username, email, phone..."
                            className="w-full bg-transparent text-black dark:text-white outline-none text-sm placeholder-gray-500 focus:placeholder-gray-400 transition-colors duration-200"
                            aria-label="Search"
                            data-testid="search-input"
                        />
                    </div>
                </div>
            </div>

            {/* Report List */}
            <div className="max-w-4xl mx-auto mt-8 space-y-4">
                {reports?.map(report => (
                    <ReportCard 
                        key={report.id} 
                        report={report} 
                        onClick={() => {
                            setSelectedReport(report);
                            setIsOpenModal(true);
                        }}
                    />
                ))}
                {reports.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No reports found
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-8 space-x-4">
                <button 
                    className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 shadow-sm
                        ${pageNumber === 0 
                            ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' 
                            : 'bg-blue-500 hover:bg-blue-600 hover:shadow-md active:bg-blue-700'} 
                        text-white font-medium`}
                    disabled={pageNumber === 0}
                    onClick={() => setPageNumber(pageNumber - 1)}
                >
                    <BiLeftArrow className="mr-2 h-4 w-4" /> Previous
                </button>

                <div className="flex items-center space-x-2">
                    <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg font-semibold min-w-[40px] text-center">
                        {pageNumber +1 }
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">of</span>
                    <span className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold min-w-[40px] text-center">
                        {totalPage || 0}
                    </span>
                </div>

                <button 
                    className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 shadow-sm
                        ${pageNumber + 1 >= totalPage 
                            ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' 
                            : 'bg-blue-500 hover:bg-blue-600 hover:shadow-md active:bg-blue-700'} 
                        text-white font-medium`}
                    onClick={() => setPageNumber(pageNumber + 1)}
                    disabled={pageNumber + 1 >= totalPage}
                >
                    Next <BiRightArrow className="ml-2 h-4 w-4" />
                </button>
            </div>

            <AdminReportModal 
                isOpen={isOpenModal} 
                onClose={onModalClose} 
                report={selectedReport} 
            />
            {loading && <Loading />}
        </div>
    );
};

export default AdminReportPage;
