import { format, toZonedTime } from "date-fns-tz";
import { differenceInDays, differenceInHours, differenceInMinutes, parseISO } from "date-fns";
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

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

  if (daysAgo > 0) {
    if (daysAgo === 1) {
      return "Yesterday";
    }
    return `${daysAgo} days ago`;
  }

  const hoursAgo = differenceInHours(today, updatedDate);
  
  if (hoursAgo > 0) {
    return `${hoursAgo} hour${hoursAgo === 1 ? '' : 's'} ago`;
  }
  
  // Less than 1 hour ago
  const minutesAgo = differenceInMinutes(today, updatedDate);
  
  if (minutesAgo > 0) {
    return `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`;
  }
  
  return "Just now";
};

// Use it instead of formatDistanceToNow for better control over locale
export const formatRelativeTime = (date: string | Date, currentLanguage: string) => {
  try {
    const locale = currentLanguage === 'vi' ? vi : enUS;
    
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: locale
    });
  } catch (error) {
    return currentLanguage === 'vi' ? 'Ngày không xác định' : 'Unknown Date';
  }
};