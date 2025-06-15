import { useEffect, useState, useRef } from 'react';
import { useToast } from '../../../context/ToastProvider';
import { Frame } from '../../../models/FrameModel';
import { getAllFrames } from '../../../services/FrameService';
import { axiosInstanceAuth } from '../../../utils/axiosInstance';
import Avatar from '../../../components/UI/user/Avatar';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';

type FrameStatus = 'ACCEPTED' | 'PROCESSING' | 'REJECTED' | 'ALL';

const PAGE_SIZE = 8;

const AdminFramePage = () => {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'reject' | null>(null);
  const [frameToAction, setFrameToAction] = useState<Frame | null>(null);
  const [filterStatus, setFilterStatus] = useState<FrameStatus>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');

  const confirmModalRef = useRef<HTMLDivElement | null>(null);
  const toast = useToast();
  const currentUser = useSelector((state: RootState) => state.auth.user);

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

  const handleStatusChange = async (frameId: string, newStatus: FrameStatus) => {
    try {
      await axiosInstanceAuth.put(`/api/admin/v1/frame/approve/${frameId}?status=${newStatus}`);
      toast.success(`Frame ${newStatus.toLowerCase()} successfully`);
      fetchAllFrames();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update frame status');
    }
  };

  const handleActionClick = (frame: Frame, action: 'accept' | 'reject') => {
    setFrameToAction(frame);
    setActionType(action);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (!frameToAction || !actionType) return;
    const newStatus = actionType === 'accept' ? 'ACCEPTED' : 'REJECTED';
    handleStatusChange(frameToAction.id, newStatus as FrameStatus);
    setIsConfirmModalOpen(false);
    setFrameToAction(null);
    setActionType(null);
  };

  const handleCancelAction = () => {
    setIsConfirmModalOpen(false);
    setFrameToAction(null);
    setActionType(null);
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

  // Filter frames by status and keyword
  const filteredFrames = frames.filter((frame) => {
    const matchesStatus = filterStatus === 'ALL' || frame.status === filterStatus;
    const matchesKeyword =
      searchKeyword.trim() === '' ||
      frame.name.toLowerCase().includes(searchKeyword.trim().toLowerCase());
    return matchesStatus && matchesKeyword;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredFrames.length / PAGE_SIZE);
  const paginatedFrames = filteredFrames.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setFilterStatus(e.target.value as FrameStatus);
  //   setCurrentPage(1); // Reset to first page when filter changes
  // };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-black dark:text-white">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold ">Frame Management</h1>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={searchKeyword}
            onChange={handleSearchChange}
            placeholder="Search by frame name..."
            className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-white bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex gap-1">
            {([
              { value: 'ALL', label: 'Tất cả' },
              { value: 'ACCEPTED', label: 'Đã duyệt' },
              { value: 'PROCESSING', label: 'Chờ duyệt' },
              { value: 'REJECTED', label: 'Từ chối' },
            ] as const).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setFilterStatus(option.value as FrameStatus);
                  setCurrentPage(1);
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${filterStatus === option.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedFrames.map((frame) => (
          <div key={frame.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="relative p-2">
              <div className='mx-auto w-48 h-48 my-4'>
                <Avatar
                  usedFrame={{
                    id: frame.id,
                    imageURL: frame.imageURL,
                    name: frame.name,
                    price: frame.price,
                  }}
                  avatarUrl={currentUser?.avatarUrl}
                  alt={frame.name}
                  width="w-48"
                />
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
                    onClick={() => handleActionClick(frame, 'accept')}
                    className="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleActionClick(frame, 'reject')}
                    className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredFrames.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
          No frames available at the moment.
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx + 1}
              onClick={() => handlePageChange(idx + 1)}
              className={`px-3 py-1 rounded ${currentPage === idx + 1
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
                }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div ref={confirmModalRef} className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4 text-center text-black dark:text-white">
              {actionType === 'accept'
                ? 'Bạn có chắc chắn chấp nhận frame này không?'
                : 'Bạn có chắc chắn từ chối frame này không?'}
            </h3>
            <div className="flex justify-between">
              <button
                onClick={handleCancelAction}
                className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 text-white rounded-lg ${actionType === 'accept'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-red-500 hover:bg-red-600'
                  }`}
              >
                {actionType === 'accept' ? 'Chấp nhận' : 'Từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFramePage;