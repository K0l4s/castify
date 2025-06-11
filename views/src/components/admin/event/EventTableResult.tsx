import { format } from 'date-fns';
import { toggleFrameEventActive } from '../../../services/FrameEventService';

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
interface EventTableResultProps {
    events: FrameEvent[];
    setEvents?: (events: FrameEvent[]) => void;
}



const EventTableResult = ({ events, setEvents }: EventTableResultProps) => {
    const toggleActive = async (eventId: string) => {
        try {
            const updatedEvent: FrameEvent | undefined = await toggleFrameEventActive(eventId);
            if (updatedEvent && setEvents) {
                setEvents(
                    events.map((event: FrameEvent) =>
                        event.id === updatedEvent.id ? { ...event, active: updatedEvent.active } : event
                    )
                );
            }
        } catch (error) {
            // Handle error if needed
            console.error(error);
        }
    }
    
    return (
        <div className="overflow-x-auto rounded-lg shadow-lg dark:shadow-black/40">
            <table className="min-w-full bg-white dark:bg-[#23232a] rounded-lg overflow-hidden">
                <thead>
                    <tr className="bg-gray-100 dark:bg-[#23232a] border-b border-gray-200 dark:border-gray-700">
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Tên sự kiện</th>
                        {/* <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Mô tả</th> */}
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Ngày bắt đầu</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Ngày kết thúc</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Giảm (%)</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Kích hoạt</th>
                        {/* <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Hiển thị</th> */}
                    </tr>
                </thead>
                <tbody>
                    {events.length > 0 ? events.map(event => (
                        <tr
                            key={event.id}
                            className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#23232a]/80 transition"
                        >
                            <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{event.name}</td>
                            {/* <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{event.description}</td> */}
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{format(new Date(event.startDate), 'dd/MM/yyyy HH:mm')}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{format(new Date(event.endDate), 'dd/MM/yyyy HH:mm')}</td>
                            <td className="px-4 py-3 text-blue-600 dark:text-blue-400 font-semibold">{event.percent * 100}%</td>
                            <td className="px-4 py-3">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={event.active}
                                        onChange={() => toggleActive(event.id)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-red-500 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:bg-red-700 rounded-full peer peer-checked:bg-green-500 transition-colors relative">
                                        <span
                                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${event.active ? 'translate-x-5' : ''
                                                }`}
                                        ></span>
                                    </div>
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        {event.active ? 'Bật' : 'Tắt'}
                                    </span>
                                </label>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                                Không tìm thấy sự kiện nào.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default EventTableResult
