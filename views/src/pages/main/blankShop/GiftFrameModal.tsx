import { useEffect, useState } from 'react';
import coin from '../../../assets/images/coin.png';
import CustomModal from '../../../components/UI/custom/CustomModal';
import { userCard } from '../../../models/User';
import { userService } from '../../../services/UserService';
import { giftFrame } from '../../../services/FrameService';

interface GiftFrameModalProps {
  isOpen: boolean;
  onClose: () => void;
  frameId: string;
  frameName: string;
  frameImage: string;
  framePrice: number;
  voucherCode?: string;
  setVoucherCode?: (e: string) => void;
  onSuccess?: () => void;
}

const GiftFrameModal = ({
  isOpen,
  onClose,
  frameId,
  frameName,
  frameImage,
  framePrice,
  voucherCode,
  setVoucherCode,
  onSuccess,
}: GiftFrameModalProps) => {
  const [friends, setFriends] = useState<userCard[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string>('');
  const [keyword, setKeyword] = useState('');
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [gifting, setGifting] = useState(false);
  const [internalVoucherCode, setInternalVoucherCode] = useState('');
  const [error, setError] = useState<string | null>(null); // <-- Add error state

  const finalVoucherCode = voucherCode ?? internalVoucherCode;
  const updateVoucherCode = setVoucherCode ?? setInternalVoucherCode;

  const fetchFriends = async () => {
    setLoadingFriends(true);
    setError(null);
    try {
      const res = await userService.getFriends(0, 50, keyword);
      setFriends(res.data?.data ?? []);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setFriends([]);
      setError('Failed to fetch friends. Please try again.');
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleGift = async () => {
    if (!selectedFriend) return;
    setGifting(true);
    setError(null);
    try {
      await giftFrame(selectedFriend, frameId, finalVoucherCode);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Gift failed', err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to send gift. Please try again.'
      );
    } finally {
      setGifting(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchFriends();
  }, [isOpen, keyword]);

  return (
    <CustomModal title={`Gift: ${frameName}`} isOpen={isOpen} onClose={onClose}>
      <div className="relative aspect-square rounded-lg overflow-hidden border dark:border-gray-700">
        <img
          src={frameImage}
          alt={frameName}
          className="w-full h-full object-contain p-4"
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Price:{" "}
          <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
            {framePrice}
            <img src={coin} alt="coin" className="w-4 h-4" />
          </span>
        </p>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Voucher Code (optional)</label>
          <input
            type="text"
            value={finalVoucherCode}
            onChange={(e) => updateVoucherCode(e.target.value)}
            placeholder="Enter voucher code"
            className="w-full px-3 py-2 text-sm border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Friend to Gift</label>
          <input
            type="text"
            placeholder="Search friends..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <div className="max-h-40 overflow-y-auto border rounded-md dark:border-gray-600">
            {loadingFriends ? (
              <p className="p-2 text-sm text-gray-500">Loading...</p>
            ) : friends.length === 0 ? (
              <p className="p-2 text-sm text-gray-500">No friends found.</p>
            ) : (
              <ul>
                {friends.map((friend) => (
                  <li
                    key={friend.id}
                    onClick={() => setSelectedFriend(friend.id)}
                    className={`p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${selectedFriend === friend.id ? 'bg-blue-100 dark:bg-blue-800' : ''
                      }`}
                  >
                    <img src={friend.avatarUrl} alt={friend.fullname} className="w-6 h-6 rounded-full" />
                    <span className="text-sm">{friend.fullname} (@{friend.username})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {error && (
          <div className="text-red-500 text-sm pt-2">{error}</div>
        )}
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <button
          type="button"
          className="inline-flex justify-center rounded-md bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="inline-flex justify-center rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
          onClick={handleGift}
          disabled={gifting || !selectedFriend}
        >
          {gifting ? "Gifting..." : "Send Gift"}
        </button>
      </div>
    </CustomModal>
  );
};

export default GiftFrameModal;
