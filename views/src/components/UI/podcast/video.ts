export const setupVideoViewTracking = (
  videoElement: HTMLVideoElement,
  incrementPodcastViews: (id: string) => Promise<any>,
  id: string
) => {
  let watchTime = 0; // Tổng thời gian đã xem
  let lastUpdateTime = 0; // Thời gian cập nhật gần nhất
  let continuousThreshold: number; // Ngưỡng thời gian xem để tăng view
  let viewIncremented = false;

  const handleLoadedMetadata = () => {
    continuousThreshold = videoElement.duration / 2;
    // continuousThreshold = 10; // Dành cho test, 10s auto tăng view
    console.log("continuousThreshold", continuousThreshold);
  };

  const handleTimeUpdate = () => {
    const currentTime = videoElement.currentTime;

    // Tính khoảng thời gian xem từ lần cập nhật trước
    if (currentTime - lastUpdateTime < 1.5) {
      watchTime += currentTime - lastUpdateTime; // Cộng dồn thời gian xem
    }

    lastUpdateTime = currentTime; // Cập nhật thời gian gần nhất

    // Kiểm tra nếu đủ điều kiện tăng view
    if (watchTime >= continuousThreshold && !viewIncremented) {
      incrementPodcastViews(id!)
        .then((response) => {
          console.log("Views incremented:", response);
        })
        .catch((error) => {
          console.error("Failed to increment views:", error);
        });

      viewIncremented = true;
      videoElement.removeEventListener("timeupdate", handleTimeUpdate); // Loại bỏ sự kiện sau khi tăng view
    }
  };

  const handlePlay = () => {
    // Reset `watchTime` nếu replay từ đầu
    if (videoElement.currentTime === 0) {
      watchTime = 0;
      viewIncremented = false; // Reset cờ
    }
    lastUpdateTime = videoElement.currentTime; // Bắt đầu theo dõi khi phát video
    videoElement.addEventListener("timeupdate", handleTimeUpdate);
  };

  const handlePause = () => {
    videoElement.removeEventListener("timeupdate", handleTimeUpdate);
  };

  videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
  videoElement.addEventListener("play", handlePlay);
  videoElement.addEventListener("pause", handlePause);

  return () => {
    videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.removeEventListener("play", handlePlay);
    videoElement.removeEventListener("pause", handlePause);
    videoElement.removeEventListener("timeupdate", handleTimeUpdate);
  };
};