import React from 'react';
import { FiX, FiAlertCircle } from 'react-icons/fi';

interface KickBanModalProps {
  isVisible: boolean;
  type: 'kick' | 'ban';
  reason: string;
  kickedBy: string;
  onClose: () => void;
}

const KickBanModal: React.FC<KickBanModalProps> = ({
  isVisible,
  type,
  reason,
  kickedBy,
  onClose
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 border-2 border-red-500">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="text-red-500" size={24} />
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
              {type === 'kick' ? 'You have been kicked' : 'You have been banned'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
            <p className="text-gray-900 dark:text-white mb-2">
              <strong>Moderator:</strong> {kickedBy}
            </p>
            <p className="text-gray-900 dark:text-white mb-2">
              <strong>Reason:</strong>
            </p>
            <p className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 p-3 rounded border italic">
              "{reason || 'No reason provided'}"
            </p>
          </div>

          {type === 'ban' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                <strong>Note:</strong> You are permanently banned from this watch party room and cannot rejoin.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default KickBanModal;