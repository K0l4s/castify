
import moment from 'moment';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { parseISO } from 'date-fns';
import { useMemo } from 'react';
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
}
const EventCalendarResult = ({ events }: EventTableResultProps) => {
    const localizer = momentLocalizer(moment);
    const calendarEvents = useMemo(() => {
        return events.map((event) => ({
            id: event.id,
            title: `${event.name} (${event.percent * 100}%)`,
            start: parseISO(event.startDate),
            end: parseISO(event.endDate),
            allDay: false,
            resource: event,
        }));
    }, [events]);
    const eventStyleGetter = (event: any) => {
        const backgroundColor = event.resource.active ? '#3B82F6' : '#9CA3AF';
        return {
            style: {
                backgroundColor,
                color: 'white',
                borderRadius: '6px',
                border: 'none',
                padding: '4px',
            },
        };
    };
    return (
        <div
            className="bg-white dark:bg-[#23232a] p-4 rounded-lg"
        >
            <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 700 }}
                eventPropGetter={eventStyleGetter}
                tooltipAccessor={(event) => event.resource.description}
                messages={{
                    next: "→",
                    previous: "←",
                    today: "Hôm nay",
                    month: "Tháng",
                    week: "Tuần",
                    day: "Ngày",
                    agenda: "Lịch biểu",
                    showMore: (total) => `+${total} sự kiện khác`,
                }}
                className=" text-black rounded-lg dark:text-white"
            />
        </div>
    )
}

export default EventCalendarResult
