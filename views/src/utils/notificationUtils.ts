// utils/notificationUtils.ts

let audioElement: HTMLAudioElement | null = null;

/**
 * Yêu cầu quyền gửi thông báo từ trình duyệt
 * @returns NotificationPermission - "granted", "denied", hoặc "default"
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!("Notification" in window)) {
    console.warn("🚫 Trình duyệt không hỗ trợ Notification API");
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();

    switch (permission) {
      case "granted":
        console.log("✅ Đã được cấp quyền gửi thông báo");
        break;
      case "denied":
        console.warn("❌ Người dùng đã từ chối quyền gửi thông báo");
        break;
      case "default":
        console.warn("⚠️ Người dùng đã đóng popup mà không chọn gì");
        break;
    }

    return permission;
  } catch (error) {
    console.error("🚨 Lỗi khi yêu cầu quyền gửi thông báo:", error);
    return "denied";
  }
};

/**
 * Gửi thông báo trình duyệt nếu đã được cấp quyền
 * @param title Tiêu đề thông báo
 * @param options Tuỳ chọn như body, icon, image...
 * @param soundUrl URL đến file âm thanh custom (tuỳ chọn)
 */
// soundUrl from assets
import soundUrl from "../assets/sound/notification.mp3";
export const sendNotification = (
  title: string,
  options?: NotificationOptions & { image?: string },
//   soundUrl?: string
): void => {
  if (!("Notification" in window)) {
    console.warn("🚫 Trình duyệt không hỗ trợ Notification API");
    return;
  }

  if (Notification.permission === "granted") {
    try {
      const notification = new Notification(title, options);

      // Nếu có âm thanh, phát ngay
      if (soundUrl) {
        if (!audioElement) {
          audioElement = new Audio(soundUrl);
        } else {
          audioElement.src = soundUrl;
        }

        audioElement.play().catch((err) => {
          console.warn("🎵 Không thể phát âm thanh:", err);
        });
      }

      // Tuỳ chọn: khi click vào notification → chuyển tab hoặc mở URL
      notification.onclick = () => {
        window.focus();
      };
    } catch (error) {
      console.error("🚨 Gửi thông báo thất bại:", error);
    }
  } else {
    console.warn("❗ Không thể gửi thông báo: chưa được cấp quyền");
  }
};
