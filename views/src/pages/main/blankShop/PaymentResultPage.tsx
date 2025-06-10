import { useSearchParams } from "react-router-dom";
import coin from "../../../assets/images/coin.png";
export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const amount = searchParams.get("amount");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border border-gray-200 dark:border-gray-700">
        {status === "SUCCESS" ? (
          <>
            <div className="flex justify-center mb-4">
              <span className="text-5xl animate-bounce">🎉</span>
            </div>
            <h1 className="text-green-600 text-2xl font-extrabold mb-2">Thanh toán thành công!</h1>
            <p className="text-lg text-gray-700 dark:text-gray-200 mb-4 flex items-center justify-center gap-2">
              Nhận được: 
              <span className="font-semibold flex items-center gap-1">
              {Number(amount) / 1000}
              <img src={coin} alt="coin" className="w-6 h-6 inline-block" />
              Coin
              </span>
            </p>
            <p className="text-gray-500 dark:text-gray-400 italic">Bạn có thể tắt tab này!</p>
          </>
        ) : status === "FAILED" ? (
          <>
            <div className="flex justify-center mb-4">
              <span className="text-5xl animate-pulse">❌</span>
            </div>
            <h1 className="text-red-600 text-2xl font-extrabold mb-2">Thanh toán thất bại</h1>
            <p className="text-lg text-gray-700 dark:text-gray-200 mb-4">
              Giao dịch không hợp lệ hoặc bị huỷ.
            </p>
            <p className="text-gray-500 dark:text-gray-400 italic">Bạn có thể tắt tab này!</p>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <span className="text-5xl animate-spin-slow">❓</span>
            </div>
            <h1 className="text-yellow-500 text-2xl font-extrabold mb-2">Không xác định</h1>
            <p className="text-lg text-gray-700 dark:text-gray-200 mb-4">
              Không thể xác định trạng thái thanh toán.
            </p>
            <p className="text-gray-500 dark:text-gray-400 italic">Bạn có thể tắt tab này!</p>
          </>
        )}
      </div>
      <style>
        {`
          .animate-spin-slow {
            animation: spin 2s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}
      </style>
    </div>
  );
}
