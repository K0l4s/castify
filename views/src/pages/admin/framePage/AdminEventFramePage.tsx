import React, { useEffect, useState } from 'react';

import { axiosInstanceAuth } from '../../../utils/axiosInstance';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import EventTableResult from '../../../components/admin/event/EventTableResult';
import EventCalendarResult from '../../../components/admin/event/EventCalendarResult';
// import { FaTableCellsColumnLock } from 'react-icons/fa6';
import { FaRegCalendarAlt, FaTable } from 'react-icons/fa';
import Tooltip from '../../../components/UI/custom/Tooltip';
import CreateFrameEventForm from '../../../components/admin/event/CreateFrameEventForm';

interface FrameEvent {
    id: string;
    name: string;
    description: string;
    bannersUrl: string[];
    createDate: string;
    startDate: string;
    endDate: string;
    percent: number;
    active: boolean;
    showEvent: boolean;
}
export enum viewTypeEnum {
    TABLE = 'TABLE',
    CALENDAR = 'CALENDAR',
}

const AdminEventFramePage: React.FC = () => {
    const [keyword, setKeyword] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [active, setActive] = useState(false);
    const [useActiveFilter, setUseActiveFilter] = useState(false);
    const [events, setEvents] = useState<FrameEvent[]>([]);
    const [viewType, setViewType] = useState<viewTypeEnum>(viewTypeEnum.TABLE)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const handleSearch = async () => {
        try {
            const params: any = {
                keyword,
                pageNumber: 0,
                pageSize: 20,
            };
            if (fromDate) params.fromDate = fromDate;
            if (toDate) params.toDate = toDate;
            if (useActiveFilter) params.active = active;

            const response = await axiosInstanceAuth.get('/api/admin/v1/frame/event/search', { params });
            setEvents(response.data);
        } catch (err) {
            console.error('Search error:', err);
        }
    };

    useEffect(() => {
        handleSearch(); // initial fetch
    }, []);


    return (
        <div className="min-h-screen transition-colors duration-300">
            {/* Title */}
            <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 mb-6 tracking-tight drop-shadow-lg">
                QUẢN LÝ SỰ KIỆN
            </h1>
            {/* Add Event Button */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 dark:from-blue-500 dark:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-800 text-white font-semibold shadow-lg transition"
                >
                    <span className="text-lg">＋</span> Thêm sự kiện mới
                </button>
                {/* ViewType Switch */}
                <div className="flex items-center gap-2">
                    <Tooltip text="Xem dưới dạng bảng">
                        <FaTable
                            className={`w-10 h-10 p-2 rounded-xl cursor-pointer transition-all duration-200 shadow-sm ${viewType === viewTypeEnum.TABLE
                                ? "bg-white dark:bg-[#23232a] text-blue-600 ring-2 ring-blue-400"
                                : "hover:bg-gray-200 dark:hover:bg-[#23232a] text-gray-400"
                                }`}
                            onClick={() => setViewType(viewTypeEnum.TABLE)}
                        />
                    </Tooltip>
                    <Tooltip text="Xem dưới dạng lịch">
                        <FaRegCalendarAlt
                            className={`w-10 h-10 p-2 rounded-xl cursor-pointer transition-all duration-200 shadow-sm ${viewType === viewTypeEnum.CALENDAR
                                ? "bg-white dark:bg-[#23232a] text-purple-600 ring-2 ring-purple-400"
                                : "hover:bg-gray-200 dark:hover:bg-[#23232a] text-gray-400"
                                }`}
                            onClick={() => setViewType(viewTypeEnum.CALENDAR)}
                        />
                    </Tooltip>
                </div>
            </div>
            {/* Filters */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="flex flex-col">
                    <label htmlFor="keyword" className="mb-1 text-gray-700 dark:text-gray-200 font-medium">
                        Từ khóa
                    </label>
                    <input
                        id="keyword"
                        type="text"
                        placeholder="Từ khóa"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#23232a] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="fromDate" className="mb-1 text-gray-700 dark:text-gray-200 font-medium">
                        Từ ngày
                    </label>
                    <input
                        id="fromDate"
                        type="datetime-local"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#23232a] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="toDate" className="mb-1 text-gray-700 dark:text-gray-200 font-medium">
                        Đến ngày
                    </label>
                    <input
                        id="toDate"
                        type="datetime-local"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#23232a] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow"
                    />
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-[#23232a] rounded-lg px-4 py-2 border border-gray-300 dark:border-gray-700 shadow">
                    <input
                        type="checkbox"
                        checked={useActiveFilter}
                        onChange={(e) => setUseActiveFilter(e.target.checked)}
                        id="useActiveFilter"
                        className="accent-blue-500 dark:accent-blue-400"
                    />
                    <label htmlFor="useActiveFilter" className="text-gray-700 dark:text-gray-200 font-medium">
                        Lọc theo trạng thái
                    </label>
                    {useActiveFilter && (
                        <>
                            <input
                                type="checkbox"
                                checked={active}
                                onChange={(e) => setActive(e.target.checked)}
                                id="active"
                                className="accent-green-500 dark:accent-green-400 ml-4"
                            />
                            <label htmlFor="active" className="text-green-700 dark:text-green-300 font-medium">
                                Đang kích hoạt
                            </label>
                        </>
                    )}
                </div>
            </div>
            <div className="flex justify-end mb-8">
                <button
                    onClick={handleSearch}
                    className="px-8 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 dark:from-blue-500 dark:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-800 text-white font-semibold shadow-lg transition"
                >
                    Tìm kiếm
                </button>
            </div>
            {/* Event Table or Calendar */}
            <div className="bg-white dark:bg-[#23232a] rounded-2xl shadow-xl p-4">
                {viewType === viewTypeEnum.TABLE ? (
                    <EventTableResult events={events} setEvents={setEvents} />
                ) : (
                    <EventCalendarResult events={events} />
                )}
            </div>
            <CreateFrameEventForm
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                setEvents={setEvents}
            />
        </div>
    );
};

export default AdminEventFramePage;
