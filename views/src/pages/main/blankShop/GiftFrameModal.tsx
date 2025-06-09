import { useEffect, useState, useRef } from 'react';
import coin from '../../../assets/images/coin.png';
import CustomModal from '../../../components/UI/custom/CustomModal';
import { userCard } from '../../../models/User';
import { userService } from '../../../services/UserService';
import { getVoucher, giftFrame } from '../../../services/FrameService';
import { EventFrame } from '../../../models/Event';
import CustomButton from '../../../components/UI/custom/CustomButton';
interface codeInfo {
  voucherCode: string;
  percent: number;
  voucherDescription: string;
  voucherName: string;
}
interface GiftFrameModalProps {
  isOpen: boolean;
  onClose: () => void;
  frameId: string;
  frameName: string;
  frameImage: string;
  framePrice: number;
  voucherCode?: string;
  event?: EventFrame;
  setVoucherCode?: (e: string) => void;
  onSuccess?: () => void;
}

const PAGE_SIZE = 50;

const GiftFrameModal = ({
  isOpen,
  onClose,
  frameId,
  frameName,
  frameImage,
  framePrice,
  event,
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
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [frameVoucherInfo, setFrameVoucherInfo] = useState<codeInfo | null>(null);
  const [finalPrice, setFinalPrice] = useState(framePrice);
  const listRef = useRef<HTMLDivElement>(null);

  const finalVoucherCode = voucherCode ?? internalVoucherCode;
  const updateVoucherCode = setVoucherCode ?? setInternalVoucherCode;

  const fetchFriends = async (reset = false) => {
    setLoadingFriends(true);
    setError(null);
    try {
      const res = await userService.getFriends(reset ? 0 : page, PAGE_SIZE, keyword);
      const newFriends = res.data?.data ?? [];
      if (reset) {
        setFriends(newFriends);
      } else {
        setFriends((prev) => [...prev, ...newFriends]);
      }
      setHasMore(newFriends.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error fetching friends:', error);
      if (reset) setFriends([]);
      setError('Failed to fetch friends. Please try again.');
      setHasMore(false);
    } finally {
      setLoadingFriends(false);
    }
  };

  // Reset friends list and page when modal opens or keyword changes
  useEffect(() => {
    if (isOpen) {
      setPage(0);
      fetchFriends(true);
    }
    // eslint-disable-next-line
  }, [isOpen, keyword]);

  // Fetch more friends when page increases (except for initial load)
  useEffect(() => {
    if (page === 0 || !isOpen) return;
    fetchFriends();
    // eslint-disable-next-line
  }, [page]);

  const handleGift = async () => {
    if (!selectedFriend) return;
    setGifting(true);
    setError(null);
    try {
      await giftFrame(selectedFriend, frameId, finalVoucherCode, event?.id);
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

  // Infinite scroll for friends list
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (!loadingFriends && hasMore && scrollTop + clientHeight >= scrollHeight - 10) {
      setPage((prev) => prev + 1);
    }
  };
  const fetchVoucherInfo = async () => {
    if (!finalVoucherCode) {
      setError('Please enter a voucher code.');
      return;
    }
    try {
      // Call the API to fetch voucher info
      const response = await getVoucher(finalVoucherCode);
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
    <CustomModal title={`Gift: ${frameName}`} isOpen={isOpen} onClose={onClose} size="xl">
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
            <div></div>
            <input
              id="voucher"
              type="text"
              value={finalVoucherCode}
              onChange={(e) => updateVoucherCode(e.target.value)}
              placeholder="Enter voucher code"
              className="w-full px-3 py-2 text-sm border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <CustomButton
              onClick={fetchVoucherInfo}
            >
              Get Voucher Info
            </CustomButton>
          </div>
          {/* Friend selection */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Friend to Gift</label>
            <input
              type="text"
              placeholder="Search friends..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <div
              className="max-h-40 overflow-y-auto border rounded-md dark:border-gray-600"
              style={{ minHeight: 80 }}
              onScroll={handleScroll}
              ref={listRef}
            >
              {friends.length === 0 && !loadingFriends ? (
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
              {loadingFriends && (
                <p className="p-2 text-sm text-gray-500">Loading...</p>
              )}
              {!loadingFriends && hasMore && friends.length > 0 && (
                <button
                  className="w-full py-2 text-sm text-blue-600 hover:underline bg-transparent"
                  onClick={() => setPage((prev) => prev + 1)}
                  type="button"
                >
                  Load more
                </button>
              )}
            </div>
          </div>
          {error && (
            <div className="text-red-500 text-sm pt-2">{error}</div>
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
              className="inline-flex justify-center rounded-md border border-transparent bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
              onClick={handleGift}
              disabled={gifting || !selectedFriend}
            >
              {gifting ? "Gifting..." : "Send Gift"}
            </button>
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default GiftFrameModal;
