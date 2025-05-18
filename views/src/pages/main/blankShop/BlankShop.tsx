import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import coin from "../../../assets/images/coin.png";
import { RootState } from "../../../redux/store";
import { Frame } from "../../../models/FrameModel";
import { getAcceptedFrames, purchaseFrame } from "../../../services/FrameService";
import { useToast } from "../../../context/ToastProvider";
import FramePreviewModal from "./FramePreviewModal";
import PurchaseConfirmationModal from "./PurchaseConfirmationModal";

const BlankShop = () => {
    const [frames, setFrames] = useState<Frame[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
    const [frameToPurchase, setFrameToPurchase] = useState<Frame | null>(null);
    const [purchasing, setPurchasing] = useState(false);
    const user = useSelector((state: RootState) => state.auth.user);
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchAcceptedFrames();
    }, []);

    const fetchAcceptedFrames = async () => {
        try {
            const data = await getAcceptedFrames();
            setFrames(data);
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
            const response = await purchaseFrame(frameToPurchase.id);
            if (response) {
                toast.success(`Frame ${frameToPurchase.name} purchased successfully!`);
                
                // Refresh frames list
                fetchAcceptedFrames();
                
                // Close modal
                setFrameToPurchase(null);
                
                // Navigate to purchased frames page
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

    const handleGift = async (frameId: string) => {
        // TODO: Implement gift functionality
        toast.info(`Gift feature for frame ${frameId} coming soon!`);
    };

    const handlePreview = (frame: Frame) => {
        setSelectedFrame(frame);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-black dark:text-white">Frame Shop</h1>
                <div className="flex gap-4">
                    <button 
                        onClick={() => navigate('/purchased-frames')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        My Purchased Frames
                    </button>
                    {/* nạp tiền */}
                    <button 
                        onClick={() => navigate('/payment')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Add Coins
                    </button>
                </div>
            </div>
            
            <div className="text-center mb-8">
                <p className="text-black dark:text-gray-400">
                    Browse our collection of beautiful frames
                </p>
                <p className="text-xl font-semibold mt-2 mb-4 text-black dark:text-white">
                    Your current balance: {user?.coin} <img src={coin} alt="coin" className="w-5 h-5 inline-block" />
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {frames.map((frame) => (
                    <div key={frame.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                        <div className="relative aspect-square">
                            <img 
                                src={frame.imageURL}
                                alt={frame.name}
                                className="w-full h-full object-contain p-4"
                            />
                            {/* Preview overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                                <button 
                                    onClick={() => handlePreview(frame)}
                                    className="px-4 py-2 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Preview
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-4 border-t dark:border-gray-700">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-lg font-semibold text-black dark:text-white">{frame.name}</h2>
                                <div className="text-blue-600 dark:text-blue-400 text-xl flex gap-1 items-center font-bold">
                                    {frame.price}
                                    <div className="w-5 h-5">
                                        <img src={coin} alt="coin" className="w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                            <button 
                                onClick={() => handleGift(frame.id)}
                                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors mr-2"
                            >
                                GIFT
                            </button>
                            <button 
                                onClick={() => handlePurchase(frame)}
                                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors ml-2"
                            >
                                BUY NOW
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {frames.length === 0 && (
                <div className="text-center text-black dark:text-gray-400 mt-8">
                    No frames available at the moment.
                </div>
            )}

            {/* Frame Preview Modal */}
            <FramePreviewModal
                isOpen={!!selectedFrame}
                onClose={() => setSelectedFrame(null)}
                frameImage={selectedFrame?.imageURL || ''}
                frameName={selectedFrame?.name || ''}
            />

            {/* Purchase Confirmation Modal */}
            <PurchaseConfirmationModal
                isOpen={!!frameToPurchase}
                onClose={() => setFrameToPurchase(null)}
                onConfirm={handleConfirmPurchase}
                frameName={frameToPurchase?.name || ''}
                frameImage={frameToPurchase?.imageURL || ''}
                framePrice={frameToPurchase?.price || 0}
                purchasing={purchasing}
            />
        </div>
    );
};

export default BlankShop;