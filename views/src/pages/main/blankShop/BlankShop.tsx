import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import coin from "../../../assets/images/coin.png";
import { RootState } from "../../../redux/store";
import { Frame } from "../../../models/FrameModel";
import { getAcceptedFrames, purchaseFrame } from "../../../services/FrameService";
import { useToast } from "../../../context/ToastProvider";
// import FramePreviewModal from "./FramePreviewModal";
import PurchaseConfirmationModal from "./PurchaseConfirmationModal";
import Payment from "./Payment";
import { getCurrentActiveFrame } from "../../../services/FrameEventService";
import { EventFrame } from "../../../models/Event";
import "swiper/css";
import "swiper/css/pagination";
import CustomCarousel from "../../../components/UI/carousel/CustomeCarousel";
import Avatar from "../../../components/UI/user/Avatar";
import GiftFrameModal from "./GiftFrameModal";

const BlankShop = () => {
    const [frames, setFrames] = useState<Frame[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
    const [frameToPurchase, setFrameToPurchase] = useState<Frame | null>(null);
    const [purchasing, setPurchasing] = useState(false);
    const [voucher, setVoucher] = useState<string>();
    const user = useSelector((state: RootState) => state.auth.user);
    const toast = useToast();
    const navigate = useNavigate();
    const [event, setEvent] = useState<EventFrame | null>(null);
    const [isGiftModalOpen, setGiftModalOpen] = useState(false);
    const currentUser = useSelector((state: RootState) => state.auth.user);
    useEffect(() => {
        fetchCurrentEvent();
    }, []);

    const fetchCurrentEvent = async () => {
        try {
            const res = await getCurrentActiveFrame();
            setEvent(res);
        } catch (error) {
            console.error("Failed to fetch current event", error);
        }
    };
    useEffect(() => {
        fetchAcceptedFrames();
    }, []);

    const fetchAcceptedFrames = async () => {
        try {
            const data = await getAcceptedFrames();
            setFrames(data);
            console.log("Fetched frames:", data);
        } catch (error) {
            toast.error('Failed to fetch frames');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (frame: Frame) => {
        setFrameToPurchase(frame);
    };

    const handleConfirmPurchase = async () => {
        if (!frameToPurchase || !user) return;

        try {
            setPurchasing(true);
            const response = await purchaseFrame(
                frameToPurchase.id,
                voucher?.trim() ? voucher.trim() : undefined
                , event?.id ? event.id : undefined
            );
            if (response) {
                toast.success(`Frame ${frameToPurchase.name} purchased successfully!`);

                fetchAcceptedFrames();

                setFrameToPurchase(null);
                navigate('/purchased-frames');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to purchase frame';
            toast.error(errorMessage);
            console.error('Purchase error:', error);
        } finally {
            setPurchasing(false);
        }
    };

    const handleGift = (frameId: string) => {
        const foundFrame = frames.find(frame => frame.id === frameId) || null;
        setSelectedFrame(foundFrame);
        if (!foundFrame) {
            toast.error('Frame not found for gifting');
            return;
        }
        setGiftModalOpen(true);
    };

    const [isOpenPayment, setIsOpenPayment] = useState(false);
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }
    return (
        <div className="container mx-auto px-4 py-10">
            {event?.showEvent && (
                <div className="mb-10">
                    <div className="w-full mx-auto rounded-3xl overflow-hidden relative shadow-xl ring-1 ring-black/5">
                        <CustomCarousel
                            slides={event.bannersUrl.map((bannerUrl) => ({
                                imageUrl: bannerUrl,
                                title: event.name,
                                descript: event.description,
                            }))}
                        />
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">🎨 Frame Shop</h1>
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={() => navigate('/purchased-frames')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-md"
                    >
                        🖼️ My Purchased
                    </button>
                    <button
                        onClick={() => setIsOpenPayment(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all shadow-md"
                    >
                        💰 Add Coins
                    </button>
                </div>
            </div>

            <div className="text-center mb-10">
                <p className="text-gray-600 dark:text-gray-300">Explore our curated collection of high-quality frames!</p>
                <p className="text-2xl font-bold mt-3 text-gray-900 dark:text-white">
                    Balance: {user?.coin}
                    <img src={coin} alt="coin" className="inline-block w-6 h-6 ml-1 align-middle" />
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                {frames.map((frame) => (
                    <div
                        key={frame.id}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col"
                    >
                        <div className="relative aspect-square w-10/12 m-auto p-5">
                            <Avatar
                                usedFrame={{
                                    id: frame.id,
                                    imageURL: frame.imageURL,
                                    name: frame.name,
                                    price: frame.price,
                                }}
                                avatarUrl={currentUser?.avatarUrl}
                                alt={frame.name}
                                width="w-full"
                                height="h-full"
                            />
                        </div>

                        <div className="px-4 mb-2 flex justify-between items-start">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{frame.name}</h2>
                            <div className="text-right">
                                {(event?.percent ?? 0) > 0 ? (
                                    <>
                                        <div className="line-through text-sm text-gray-400 flex items-center gap-1">
                                            {frame.price}
                                            <img src={coin} alt="coin" className="w-4 h-4" />
                                        </div>
                                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                            {event ? Math.round(frame.price * (1 - event.percent)) : frame.price}
                                            <img src={coin} alt="coin" className="w-5 h-5" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                        {frame.price}
                                        <img src={coin} alt="coin" className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-auto px-4 py-3 bg-gray-50 dark:bg-gray-900/40 flex gap-3">
                            <button
                                onClick={() => handleGift(frame.id)}
                                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 rounded-xl transition-colors"
                            >
                                🎁 Gift
                            </button>
                            <button
                                onClick={() => handlePurchase(frame)}
                                disabled={frame.buy}
                                className={`w-full ${!frame.buy? 'bg-blue-500 hover:bg-blue-600':'bg-gray-500'}  disabled:cursor-not-allowed  text-white font-medium py-2 rounded-xl transition-colors`}
                            >
                                🛒 Buy
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {frames.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-10 text-lg">
                    No frames available at the moment. 🚫
                </div>
            )}

            {/* Modals */}
            {/* <FramePreviewModal
                isOpen={!!selectedFrame}
                onClose={() => setSelectedFrame(null)}
                frameImage={selectedFrame?.imageURL || ''}
                frameName={selectedFrame?.name || ''}
            /> */}

            <PurchaseConfirmationModal
                isOpen={!!frameToPurchase}
                onClose={() => setFrameToPurchase(null)}
                onConfirm={handleConfirmPurchase}
                frameName={frameToPurchase?.name || ''}
                frameImage={frameToPurchase?.imageURL || ''}
                framePrice={frameToPurchase?.price || 0}
                purchasing={purchasing}
                event={event?? undefined}
                voucherCode={voucher}
                setVoucherCode={setVoucher}
            />
            {/* <GiftFrameModal
                isOpen={isGiftModalOpen} */}
            <GiftFrameModal
                isOpen={isGiftModalOpen}
                onClose={() => setGiftModalOpen(false)}
                frameId={selectedFrame?.id || ''}
                frameName={selectedFrame?.name || ''}
                frameImage={selectedFrame?.imageURL || ''}
                framePrice={selectedFrame?.price || 0}
                voucherCode={voucher}
                setVoucherCode={setVoucher}
                event={event ?? undefined}
                // gifting={isGifting}
                onSuccess={() => toast.success('Gift sent successfully!')}
            />
            <Payment
                isOpen={isOpenPayment}
                onClose={() => setIsOpenPayment(false)}
            />
        </div>

    );
};

export default BlankShop;