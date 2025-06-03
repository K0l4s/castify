
import coin from '../../../assets/images/coin.png';
import CustomModal from '../../../components/UI/custom/CustomModal';

interface PurchaseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  frameName: string;
  frameImage: string;
  framePrice: number;
  purchasing?: boolean;
  voucherCode?:string,
  setVoucherCode:(e:string)=>void;
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
  setVoucherCode
}: PurchaseConfirmationModalProps) => {
  return (
    <CustomModal title={frameName} isOpen={isOpen} onClose={onClose}>
      {/* Ảnh frame */}
      <div className="relative aspect-square rounded-lg overflow-hidden border dark:border-gray-700">
        <img
          src={frameImage}
          alt={frameName}
          className="w-full h-full object-contain p-4"
        />
      </div>

      {/* Thông tin */}
      <div className="space-y-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Frame Name:{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {frameName}
          </span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Price:{" "}
          <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
            {framePrice}
            <img src={coin} alt="coin" className="w-4 h-4" />
          </span>
        </p>

        {/* Nhập mã voucher */}
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
            className="w-full px-3 py-2 text-sm border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Nút hành động */}
      <div className="pt-4 flex justify-end gap-3">
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

    </CustomModal>

  );
};

export default PurchaseConfirmationModal; 