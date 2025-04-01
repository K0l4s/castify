import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import coin from "../../../assets/images/coin.png";
import { RootState } from "../../../redux/store";
import { Frame } from "../../../models/FrameModel";
import { getAcceptedFrames } from "../../../services/FrameService";
import { useToast } from "../../../context/ToastProvider";

const BlankShop = () => {
    const [frames, setFrames] = useState<Frame[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useSelector((state: RootState) => state.auth.user);
    const toast = useToast();

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

    const handlePurchase = async (frameId: string) => {
        // TODO: Implement purchase functionality
        toast.success('Frame purchased successfully!');
    };

    const handleGift = async (frameId: string) => {
        // TODO: Implement gift functionality
        toast.info('Gift feature coming soon!');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="flex">
                <main className="flex-1 p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold">Welcome {user?.firstName} to Frame Shop!</h1>
                        <p className="text-gray-500 mt-5 mb-5">
                            Browse our collection of beautiful frames
                        </p>
                        <p className="text-xl font-semibold mb-5">
                            Your current balance: {user?.coin} <img src={coin} alt="coin" className="w-5 h-5 inline-block" />
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {frames.map((frame) => (
                            <div key={frame.id} className="bg-white p-4 rounded shadow-md text-black">
                                <div className="relative aspect-square mb-4">
                                    <img
                                        src={frame.imageURL}
                                        alt={frame.name}
                                        className="w-full h-full object-contain p-4"
                                    />
                                    {/* Preview overlay */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                                        <button className="px-4 py-2 bg-white text-black rounded-lg">
                                            Preview
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold">{frame.name}</h3>
                                <p className="text-blue-600 text-xl flex gap-1 items-center font-bold">
                                    100
                                    <div className="w-5 h-5">
                                        <img src={coin} alt="coin" className="w-full" />
                                    </div>
                                </p>
                                <div className="flex gap-3 px-2">
                                    <button 
                                        onClick={() => handleGift(frame.id)}
                                        className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500"
                                    >
                                        GIFT
                                    </button>
                                    <button 
                                        onClick={() => handlePurchase(frame.id)}
                                        className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500"
                                    >
                                        BUY NOW
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {frames.length === 0 && (
                        <div className="text-center text-gray-500 mt-8">
                            No frames available at the moment.
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default BlankShop;