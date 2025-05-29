import { useEffect, useState } from 'react';
import { useToast } from '../../../context/ToastProvider';
import { Frame } from '../../../models/FrameModel';
import { applyFrame, cancelCurrentFrame, getPurchasedFrames } from '../../../services/FrameService';
import { BiXCircle } from 'react-icons/bi';

const PurchasedFrames = () => {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchPurchasedFrames();
  }, []);

  const fetchPurchasedFrames = async () => {
    try {
      const data = await getPurchasedFrames();
      setFrames(data);
    } catch (error) {
      toast.error('Failed to fetch purchased frames');
    } finally {
      setLoading(false);
    }
  };

  const handleAppyFrame = async (frameId: string) => {
    try {
      await applyFrame(frameId);
      toast.success('Frame applied successfully!');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to apply frame');
    }
  };

  const handleCancelFrame = async () => {
    try {
      await cancelCurrentFrame();
      toast.success('Frame canceled successfully!');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to cancel frame');
    }
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
        <h1 className="text-2xl font-bold text-black dark:text-white">My Purchased Frames</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Cancel Frame Card */}
        {frames.length > 0 && (
          <div
            onClick={handleCancelFrame}
            className="cursor-pointer bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-600 rounded-2xl shadow-md hover:shadow-xl transition-shadow p-4 flex flex-col items-center justify-center text-center"
          >
            <BiXCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Cancel Current Frame</h2>
            <p className="text-sm text-red-500 dark:text-red-300 mt-2">
              Click here to remove the currently applied frame.
            </p>
          </div>
        )}

        {/* Frame Cards */}
        {frames.map((frame) => (
          <div
            key={frame.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="relative aspect-square group">
              <img
                src={frame.imageURL}
                alt={frame.name}
                className="w-full h-full object-contain p-4"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition duration-300 flex items-center justify-center">
                <button className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors">
                  Preview
                </button>
              </div>
            </div>

            <div className="p-4 border-t dark:border-gray-700 space-y-2">
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold text-black dark:text-white">{frame.name}</h2>
                <span className="px-3 py-1 rounded-full text-sm font-medium text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                  Purchased
                </span>
              </div>
              <div className="text-sm text-black dark:text-gray-300">
                Purchased on: {new Date(frame.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-center">
              <button
                onClick={() => handleAppyFrame(frame.id)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
              >
                Use Frame
              </button>
            </div>
          </div>
        ))}
      </div>

      {frames.length === 0 && (
        <div className="text-center text-black dark:text-gray-300 mt-8">
          You haven't purchased any frames yet.
        </div>
      )}
    </div>
  );
};

export default PurchasedFrames;
