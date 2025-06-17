// import image test from public/test/speed-test.jpg
export const SPEED_TEST_IMAGE_URL = "/50mb.jpg"; // Đường dẫn đến ảnh test tốc độ mạng
export async function testNetworkSpeed(): Promise<number> {
  const startTime = performance.now();

  try {
    const response = await fetch(SPEED_TEST_IMAGE_URL, { cache: "no-store" }); // tránh cache
    await response.blob(); // chỉ cần tải file, không cần hiển thị

    const endTime = performance.now();
    const durationInSeconds = (endTime - startTime) / 1000;

    // Mbps = (Bytes / 1024 / 1024) * 8 / seconds
    const speedMbps = (50.6 * 8) / (1024 * 1024 * durationInSeconds);
    return +speedMbps.toFixed(2);
  } catch (error) {
    console.error("Lỗi đo tốc độ mạng:", error);
    return 0;
  }
}
