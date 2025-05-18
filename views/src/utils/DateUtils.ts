import { format, toZonedTime } from "date-fns-tz";
import { differenceInDays, parseISO } from "date-fns";

const timeZone = 'Asia/Bangkok';

export const formatDateTime = (dateTime: string) => {
  if (dateTime === null) {
    return 'N/A';
  }
  const zonedDate = toZonedTime(dateTime, timeZone);
  return format(zonedDate, 'HH:mm dd-MM-yyyy', { timeZone: timeZone });
};

export const formatDate = (dateTime: string) => {
  if (dateTime === null) {
    return 'N/A';
  }
  const zonedDate = toZonedTime(dateTime, timeZone);
  return format(zonedDate, 'dd-MM-yyyy', { timeZone: timeZone });
};

export const formatLastUpdatedFromNow = (dateTime: string): string => {
  if (!dateTime) return "Undefined";

  const updatedDate = parseISO(dateTime);
  const today = new Date();

  const daysAgo = differenceInDays(today, updatedDate);

  if (daysAgo > 30) {
    return "More than 30 days ago";
  }

  if (daysAgo === 0) {
    return "Today";
  }

  if (daysAgo === 1) {
    return "Yesterday";
  }

  return `${daysAgo} days ago`;
};