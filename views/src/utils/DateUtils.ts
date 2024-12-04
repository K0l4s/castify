import { format, toZonedTime } from "date-fns-tz";

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