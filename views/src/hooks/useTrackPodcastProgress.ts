import { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BaseApi } from '../utils/axiosInstance';

export function useTrackPodcastProgress({
  podcastId,
  userId,
  videoElementId = 'custom-podcast-video',
}: {
  podcastId: string;
  userId: string;
  videoElementId?: string;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentTime = () => {
      const video = document.getElementById(videoElementId) as HTMLVideoElement | null;
      return video?.currentTime ?? 0;
    };

    const sendTrackingData = async () => {
      const pauseTime = getCurrentTime();
      try {
        await axios.post(BaseApi+'/api/v1/tracking', {
          podcastId,
          pauseTime,
          userId,
        });
      } catch (err) {
        console.error('Failed to send tracking data:', err);
      }
    };

    const handleClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest('a');

      if (anchor && anchor.href) {
        // Nội bộ (internal) link
        const isInternal = anchor.origin === window.location.origin;

        if (isInternal) {
          event.preventDefault(); // chặn điều hướng mặc định
          await sendTrackingData();
          navigate(anchor.pathname + anchor.search + anchor.hash); // điều hướng thủ công
        }
      }
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [podcastId, userId, videoElementId, navigate]);
}
