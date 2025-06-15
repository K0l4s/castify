import React, { useEffect, useState } from 'react';

import { axiosInstanceAuth } from '../../../utils/axiosInstance';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import EventTableResult from '../../../components/admin/event/EventTableResult';
// import { FaTableCellsColumnLock } from 'react-icons/fa6';
import CreateFrameEventForm from '../../../components/admin/event/CreateFrameEventForm';
import { FaSearch } from 'react-icons/fa';
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
        <div className="p-6  mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-blue-700">Quản lý sự kiện</h1>
            <div className="flex flex-wrap gap-2 mb-4 items-center">
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    + Thêm sự kiện
                </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4 text-black dark:text-white">
                <label className="flex flex-col">
                    <span className="mb-1 text-sm">Từ khóa</span>
                    <input
                        type="text"
                        placeholder="Từ khóa"
                        value={keyword}
                        onChange={e => setKeyword(e.target.value)}
                        className="border px-2 py-1 rounded text-black dark:text-white bg-white dark:bg-gray-800"
                    />
                </label>
                <label className="flex flex-col">
                    <span className="mb-1 text-sm">Từ ngày</span>
                    <input
                        type="datetime-local"
                        value={fromDate}
                        onChange={e => setFromDate(e.target.value)}
                        className="border px-2 py-1 rounded text-black dark:text-white bg-white dark:bg-gray-800"
                    />
                </label>
                <label className="flex flex-col">
                    <span className="mb-1 text-sm">Đến ngày</span>
                    <input
                        type="datetime-local"
                        value={toDate}
                        onChange={e => setToDate(e.target.value)}
                        className="border px-2 py-1 rounded text-black dark:text-white bg-white dark:bg-gray-800"
                    />
                </label>
                <div className="flex flex-col items-center">
                    <span className="mb-1 text-sm">Trạng thái</span>
                    <div className="flex items-center gap-2">
                        <div
                            className={`cursor-pointer px-3 py-1 rounded border ${!useActiveFilter ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-black dark:bg-gray-800 dark:text-white border-gray-300'}`}
                            onClick={() => setUseActiveFilter(false)}
                        >
                            Tất cả
                        </div>
                        <div
                            className={`cursor-pointer px-3 py-1 rounded border ${useActiveFilter && active ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-black dark:bg-gray-800 dark:text-white border-gray-300'}`}
                            onClick={() => {
                                setUseActiveFilter(true);
                                setActive(true);
                            }}
                        >
                            Đang kích hoạt
                        </div>
                        <div
                            className={`cursor-pointer px-3 py-1 rounded border ${useActiveFilter && !active ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-black dark:bg-gray-800 dark:text-white border-gray-300'}`}
                            onClick={() => {
                                setUseActiveFilter(true);
                                setActive(false);
                            }}
                        >
                            Không kích hoạt
                        </div>
                        <Tooltip text="Lọc sự kiện" >
                        <button
                            onClick={handleSearch}
                            className="bg-blue-500 hover:bg-blue-600 text-white h-full px-4 py-1 rounded self-end"
                        >
                            <FaSearch className="inline mr-1" />
                        </button>
                        </Tooltip>
                    </div>

                </div>

            </div>
            <div>
                <EventTableResult events={events} setEvents={setEvents} />

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
