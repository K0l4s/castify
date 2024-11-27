
export const captureFrameFromVideo = (videoFile: File, callback: (thumbnail: string, thumbnailFile: File) => void) => {
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
      const thumbnailFile = dataURLtoFile(thumbnail, 'thumbnail.jpg');
      callback(thumbnail, thumbnailFile);
    }
    URL.revokeObjectURL(videoURL);
    video.remove();
  });

  video.addEventListener('error', (e) => {
    console.error('Error loading video file:', e);
    URL.revokeObjectURL(videoURL);
    video.remove();
  });

  video.load();
};

const dataURLtoFile = (dataurl: string, filename: string) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};