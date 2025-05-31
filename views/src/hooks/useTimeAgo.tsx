import { useEffect, useState } from "react";
import { formatDistanceToNow } from 'date-fns';

const useTimeAgo = (timestamp: string | null, updateInterval: number = 30000) => {
  const [, setForceUpdate] = useState(0);
  
  useEffect(() => {
    if (!timestamp) return;
    
    const messageTime = new Date(timestamp);
    const shouldUpdate = () => {
      const now = new Date();
      const diffInMinutes = (now.getTime() - messageTime.getTime()) / (1000 * 60);
      return diffInMinutes < 120; // Chỉ cập nhật cho tin nhắn trong 2 giờ
    };
    
    if (shouldUpdate()) {
      const interval = setInterval(() => {
        if (shouldUpdate()) {
          setForceUpdate(prev => prev + 1);
        }
      }, updateInterval);
      
      return () => clearInterval(interval);
    }
  }, [timestamp, updateInterval]);
  
  return timestamp ? formatDistanceToNow(new Date(timestamp), { addSuffix: true }) : null;
};

export default useTimeAgo;