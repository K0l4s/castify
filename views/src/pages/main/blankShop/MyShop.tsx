import { useEffect, useState, useRef } from 'react';
import { useToast } from '../../../context/ToastProvider';
import defaultFrame from '../../../assets/images/frame_test.png';
import { Frame } from '../../../models/FrameModel';
import { getMyUploads, deleteFrame, updateFrame } from '../../../services/FrameService';
import FramePreviewModal from './FramePreviewModal';
import FrameUploadModal from '../../../components/modals/frame/FrameUploadModal';
import coin from '../../../assets/images/coin.png';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import Avatar from '../../../components/UI/user/Avatar';

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

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, price: number) => void;
  frame: Frame | null;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, frame }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);

  useEffect(() => {
    if (frame) {
      setName(frame.name);
      setPrice(frame.price);
    }
  }, [frame]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove leading zeros and convert to number
    const numericValue = value === '' ? 0 : parseInt(value.replace(/^0+/, ''), 10);
    setPrice(numericValue);
  };

  if (!isOpen || !frame) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[480px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-black dark:text-white">Edit Frame</h2>

        {/* Frame Image and Status */}
        <div className="mb-6">
          <div className="relative aspect-square mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <img
              src={frame.imageURL || defaultFrame}
              alt={frame.name}
              className="w-full h-full object-contain p-4"
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Created: {new Date(frame.createdAt).toLocaleDateString()}
            </span>
            {getStatusBadge(frame.status)}
          </div>
        </div>

        {/* Edit Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Frame Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter frame name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price
            </label>
            <div className="relative">
              <input
                type="number"
                value={price || ''}
                onChange={handlePriceChange}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                placeholder="Enter price"
                min="0"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5">
                <img src={coin} alt="coin" className="w-full" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSave(name, price);
                onClose();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MyShop = () => {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFrame, setEditingFrame] = useState<Frame | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteFrameId, setDeleteFrameId] = useState<string | null>(null);
  const deleteModalRef = useRef<HTMLDivElement | null>(null);
  const toast = useToast();

  useEffect(() => {
    fetchMyFrames();
  }, []);

  const fetchMyFrames = async () => {
    try {
      const data = await getMyUploads();
      setFrames(data);
    } catch (error) {
      toast.error('Failed to fetch frames');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    setDeleteFrameId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteFrameId) return;

    try {
      await deleteFrame(deleteFrameId);
      toast.success('Frame deleted successfully');
      fetchMyFrames();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete frame');
    } finally {
      setIsDeleting(false);
      setDeleteFrameId(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleting(false);
    setDeleteFrameId(null);
  };

  const handleEdit = (frame: Frame) => {
    setEditingFrame(frame);
    setIsEditModalOpen(true);
  };
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const handleSaveEdit = async (name: string, price: number) => {
    if (!editingFrame) return;

    try {
      await updateFrame(editingFrame.id, name, price);
      toast.success('Frame updated successfully');
      fetchMyFrames();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update frame');
    }
  };

  // const handlePreview = (frame: Frame) => {
  //   setSelectedFrame(frame);
  // };

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
        <h1 className="text-2xl font-bold text-black dark:text-white">My Frames</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Upload New Frame
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {frames.map((frame) => (
          <div key={frame.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="relative aspect-square">
              {/* <img 
                src={frame.imageURL || defaultFrame}
                alt={frame.name}
                className="w-full h-full object-contain p-4"
              /> */}
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
              {/* Preview overlay */}
              {/* <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                <button 
                  onClick={() => handlePreview(frame)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Preview
                </button>
              </div> */}
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

              <div className="flex justify-between items-center">
                <span className="text-sm text-black dark:text-gray-300">
                  {new Date(frame.createdAt).toLocaleDateString()}
                </span>
                {getStatusBadge(frame.status)}
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
              <button
                onClick={() => handleEdit(frame)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(frame.id)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {frames.length === 0 && (
        <div className="text-center text-black dark:text-gray-400 mt-8">
          You haven't uploaded any frames yet.
        </div>
      )}

      {/* Frame Preview Modal */}
      <FramePreviewModal
        isOpen={!!selectedFrame}
        onClose={() => setSelectedFrame(null)}
        frameImage={selectedFrame?.imageURL || ''}
        frameName={selectedFrame?.name || ''}
      />

      {/* Frame Upload Modal */}
      <FrameUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          fetchMyFrames();
          setIsUploadModalOpen(false);
        }}
      />

      {/* Frame Edit Modal */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingFrame(null);
        }}
        onSave={handleSaveEdit}
        frame={editingFrame}
      />

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div ref={deleteModalRef} className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4 text-center text-black dark:text-white">
              Bạn có chắc chắn xóa frame này không?
            </h3>
            <div className="flex justify-between">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyShop; 