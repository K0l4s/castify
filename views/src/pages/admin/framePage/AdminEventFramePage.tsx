import React, { useEffect, useState } from 'react';

import { axiosInstanceAuth } from '../../../utils/axiosInstance';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import EventTableResult from '../../../components/admin/event/EventTableResult';
import EventCalendarResult from '../../../components/admin/event/EventCalendarResult';
// import { FaTableCellsColumnLock } from 'react-icons/fa6';
import { FaRegCalendarAlt, FaTable } from 'react-icons/fa';
import Tooltip from '../../../components/UI/custom/Tooltip';

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
        <div className="min-h-screen p-6 transition-colors duration-300">
            {/* title */}
            <h1 className='text-2xl font-bold text-black mb-2 dark:text-white'>QUẢN LÝ SỰ KIỆN</h1>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <input
                    type="text"
                    placeholder="Từ khóa"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#23232a] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="datetime-local"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#23232a] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="datetime-local"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#23232a] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={useActiveFilter}
                        onChange={(e) => setUseActiveFilter(e.target.checked)}
                        id="useActiveFilter"
                        className="accent-blue-500 dark:accent-blue-400"
                    />
                    <label htmlFor="useActiveFilter" className="text-gray-700 dark:text-gray-200">Lọc theo trạng thái</label>
                    {useActiveFilter && (
                        <>
                            <input
                                type="checkbox"
                                checked={active}
                                onChange={(e) => setActive(e.target.checked)}
                                id="active"
                                className="accent-green-500 dark:accent-green-400 ml-4"
                            />
                            <label htmlFor="active" className="text-gray-700 dark:text-gray-200">Đang kích hoạt</label>
                        </>
                    )}
                </div>
                <button
                    onClick={handleSearch}
                    className="md:col-span-2 lg:col-span-1 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold transition"
                >
                    Tìm kiếm
                </button>
            </div>
            {/* viewType icon selected */}
            <div className='text-black dark:text-white flex items-center gap-1 justify-end'>
                <Tooltip text='Xem dưới dạng bảng'>
                    <FaTable className={`w-10 h-10 hover:bg-gray-200 p-3 rounded-xl ${viewType === viewTypeEnum.TABLE && "text-red-500"}`} onClick={() => setViewType(viewTypeEnum.TABLE)} />
                </Tooltip>
                <Tooltip text='Xem dưới dạng lịch'>
                    <FaRegCalendarAlt className={`w-10 h-10 hover:bg-gray-200 p-3 rounded-xl ${viewType === viewTypeEnum.CALENDAR && "text-red-500"}`} onClick={() => setViewType(viewTypeEnum.CALENDAR)} />
                </Tooltip>
            </div>
            {
                viewType === viewTypeEnum.TABLE ?
                    <EventTableResult events={events} />
                    :
                    <EventCalendarResult events={events} />
                // null
            }
        </div>
    );
};

export default AdminEventFramePage;
