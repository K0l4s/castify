import { useEffect, useState } from 'react';
import { useToast } from '../../../context/ToastProvider';
import { Frame } from '../../../models/FrameModel';
import { getAllFrames, updateFrame } from '../../../services/FrameService';

const AdminFramePage = () => {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchAllFrames();
  }, []);

  const fetchAllFrames = async () => {
    try {
      const data = await getAllFrames();
      setFrames(data);
    } catch (error) {
      toast.error('Failed to fetch frames');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (frameId: string, newStatus: 'ACCEPTED' | 'REJECTED') => {
    try {
      await updateFrame(frameId, { status: newStatus });
      toast.success(`Frame ${newStatus.toLowerCase()} successfully`);
      fetchAllFrames(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update frame status');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACCEPTED: {
        color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
        text: 'Accepted'
      },
      PROCESSING: {
        color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
        text: 'Processing'
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
        <h1 className="text-2xl font-bold dark:text-white">Frame Management</h1>
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
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(frame.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
              {frame.status === 'PROCESSING' && (
                <>
                  <button 
                    onClick={() => handleStatusChange(frame.id, 'ACCEPTED')}
                    className="text-green-500 hover:text-green-600"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleStatusChange(frame.id, 'REJECTED')}
                    className="text-red-500 hover:text-red-600"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {frames.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
          No frames available at the moment.
        </div>
      )}
    </div>
  );
};

export default AdminFramePage; 