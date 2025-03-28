import { useEffect, useState } from 'react';
import { useToast } from '../../../context/ToastProvider';
import defaultFrame from '../../../assets/images/frame_test.png';

interface Frame {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

const MyShop = () => {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchMyFrames();
  }, []);

  const fetchMyFrames = async () => {
    try {
      // TODO: Thay thế bằng API call thực tế
      const response = await fetch('/api/my-frames');
      const data = await response.json();
      setFrames(data);
    } catch (error) {
      toast.error('Failed to fetch frames');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      APPROVED: {
        color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
        text: 'Approved'
      },
      PENDING: {
        color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
        text: 'Pending'
      },
      REJECTED: {
        color: 'text-red-600 bg-red-100 dark:bg-red-900/30',
        text: 'Rejected'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
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
        <h1 className="text-2xl font-bold dark:text-white">My Frames</h1>
        <button 
          onClick={() => {/* Implement upload new frame */}}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Upload New Frame
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {frames.map((frame) => (
          <div key={frame.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="relative aspect-square">
              <img 
                src={frame.imageUrl || defaultFrame}
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
            
            <div className="p-4 border-t dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold dark:text-white">{frame.name}</h2>
                {getStatusBadge(frame.status)}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-blue-500 font-bold">
                  {frame.price} Coins
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(frame.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
              <button 
                onClick={() => {/* Implement edit */}}
                className="text-blue-500 hover:text-blue-600"
              >
                Edit
              </button>
              <button 
                onClick={() => {/* Implement delete */}}
                className="text-red-500 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {frames.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
          You haven't uploaded any frames yet.
        </div>
      )}
    </div>
  );
};

export default MyShop; 