export const captureFrameFromVideo = (videoFile: File, callback: (thumbnail: string) => void) => {
  const video = document.createElement('video');
  const videoURL = URL.createObjectURL(videoFile);
  video.src = videoURL;
  video.crossOrigin = 'anonymous';

  video.addEventListener('loadeddata', () => {
    video.currentTime = Math.random() * video.duration;
  });

  video.addEventListener('seeked', () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnail = canvas.toDataURL('image/jpeg');
      callback(thumbnail);
    }
    URL.revokeObjectURL(videoURL);
  });

  video.addEventListener('error', (e) => {
    console.error('Error loading video file:', e);
    URL.revokeObjectURL(videoURL);
  });
};