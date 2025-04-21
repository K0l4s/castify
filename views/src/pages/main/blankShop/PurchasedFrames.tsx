import { useEffect, useState } from 'react';
import { useToast } from '../../../context/ToastProvider';
import { Frame } from '../../../models/FrameModel';
import { applyFrame, getPurchasedFrames } from '../../../services/FrameService';

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
      // Call the API to apply the frame
      await applyFrame(frameId);
      toast.success('Frame applied successfully!');
    } catch (error) {
      toast.error('Failed to apply frame');
    }
  }
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
                <button className="px-4 py-2 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  Preview
                </button>
              </div>
            </div>
            
            <div className="p-4 border-t dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold text-black dark:text-white">{frame.name}</h2>
                <span className="px-3 py-1 rounded-full text-sm font-medium text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                  Purchased
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-black dark:text-gray-300">
                  Purchased on: {new Date(frame.createdAt).toLocaleDateString()}
                </span>
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