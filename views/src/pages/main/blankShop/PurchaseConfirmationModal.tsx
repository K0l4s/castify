
import { useEffect, useState } from 'react';
import coin from '../../../assets/images/coin.png';
import CustomButton from '../../../components/UI/custom/CustomButton';
import CustomModal from '../../../components/UI/custom/CustomModal';
import { EventFrame } from '../../../models/Event';
import { getVoucher } from '../../../services/FrameService';

interface codeInfo {
  voucherCode: string;
  percent: number;
  voucherDescription: string;
  voucherName: string;
}
interface PurchaseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  frameName: string;
  frameImage: string;
  framePrice: number;
  purchasing?: boolean;
  event?: EventFrame,
  voucherCode?: string,
  setVoucherCode: (e: string) => void;
}

const PurchaseConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  frameName,
  frameImage,
  framePrice,
  purchasing = false,
  voucherCode,
  event,
  setVoucherCode
}: PurchaseConfirmationModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const [frameVoucherInfo, setFrameVoucherInfo] = useState<codeInfo | null>(null);
  const [finalPrice, setFinalPrice] = useState(framePrice);
  const fetchVoucherInfo = async () => {
      if (!voucherCode) {
        setError('Please enter a voucher code.');
        return;
      }
      try {
        // Call the API to fetch voucher info
        const response = await getVoucher(voucherCode);
        // Handle the response as needed
        setFrameVoucherInfo(response);
        console.log('Voucher Info:', response);
        // Optionally, you can show a success message or update the UI
      } catch (error) {
        console.error('Error fetching voucher info:', error);
        setError('Failed to fetch voucher info. Please try again.');
      }
    }
  
    useEffect(() => {
      // Calculate price after event discount
      let discountedPrice = framePrice;
      if (event) {
        discountedPrice = framePrice * (1 - event.percent);
      }
      // Apply voucher if available
      if (frameVoucherInfo) {
        discountedPrice = discountedPrice * (1 - frameVoucherInfo.percent);
      }
      setFinalPrice(Math.round(discountedPrice));
    }, [framePrice, event, frameVoucherInfo]);
  return (
    <CustomModal title="Purchase Confirmation" isOpen={isOpen} onClose={onClose} size="xl">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Frame Image on the left */}
        <div className="flex-shrink-0 flex justify-center items-start md:items-center">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden border dark:border-gray-700">
            <img
              src={frameImage}
              alt={frameName}
              className="w-full h-full object-contain p-2"
            />
          </div>
        </div>
        {/* Info on the right */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              {frameName}
            </p>
           <div className="flex items-center gap-2">
              <span className={`text-sm ${event ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'} flex items-center gap-1`}>
                {framePrice}
                <img src={coin} alt="coin" className="w-4 h-4" />
              </span>
              {/* Giá sau khi giảm event */}
              {event && (
                <span className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 font-semibold">
                  {Math.round(framePrice * (1 - event.percent))}
                  <img src={coin} alt="coin" className="w-4 h-4" />
                  <span className="ml-1">(Event Discount)</span>
                </span>
              )}
            </div>
            {/* Số tiền giảm khi áp dụng voucher & event */}
            {frameVoucherInfo && (
              <div className="text-sm text-green-600 dark:text-green-400">
                {(() => {
                  // Giá sau event
                  const afterEvent = event ? framePrice * (1 - event.percent) : framePrice;
                  // Giá sau voucher
                  const afterVoucher = afterEvent * (1 - frameVoucherInfo.percent);
                  // Số tiền giảm
                  const discount = Math.round(afterEvent - afterVoucher);
                  return (
                    <>
                      -{discount} <img src={coin} alt="coin" className="inline w-4 h-4" /> ({frameVoucherInfo.voucherName} - {frameVoucherInfo.percent * 100}% off)
                    </>
                  );
                })()}
              </div>
            )}
            {/* số tiền phải trả */}
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              Total: {finalPrice} <img src={coin} alt="coin" className="inline w-4 h-4" />
            </div>
          </div>
          {/* Voucher input */}
          <div className="space-y-1">
            <label
              htmlFor="voucher"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Voucher Code (optional)
            </label>
            <input
              id="voucher"
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              placeholder="Enter voucher code"
              className="px-3 py-2 text-sm border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* nút lấy thông tin voucher*/}
            <CustomButton 
              onClick={fetchVoucherInfo}>
              Get Voucher Info
            </CustomButton>
          </div>
          {/* Error message */}
          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          {/* Action buttons */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={onConfirm}
              disabled={purchasing}
            >
              {purchasing ? "Processing..." : "Confirm Purchase"}
            </button>
          </div>
        </div>
      </div>
    </CustomModal>

  );
};

export default PurchaseConfirmationModal; 