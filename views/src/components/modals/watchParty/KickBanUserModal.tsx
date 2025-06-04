import React, { useState } from 'react';
import { FiUser, FiUserX, FiAlertTriangle } from 'react-icons/fi';
import CustomModal from '../../UI/custom/CustomModal';
import CustomButton from '../../UI/custom/CustomButton';
import CustomInput from '../../UI/custom/CustomInput';
import Avatar from '../../UI/user/Avatar';
import defaultAvatar from '../../../assets/images/default_avatar.jpg';

interface KickBanUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  type: 'kick' | 'ban';
  username: string;
  avatarUrl?: string;
  loading?: boolean;
}

const KickBanUserModal: React.FC<KickBanUserModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  username,
  avatarUrl,
  loading = false
}) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason.trim());
      setReason(''); // Clear form
    }
  };

  const handleClose = () => {
    setReason(''); // Clear form when closing
    onClose();
  };

  const isKick = type === 'kick';
  const actionText = isKick ? 'Kick' : 'Ban';
  // const actionColor = isKick ? 'orange' : 'red';

  return (
    <CustomModal
      title={`${actionText} User`}
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      animation="zoom"
      closeOnOutsideClick={!loading}
      closeOnEsc={!loading}
    >
      <div className="space-y-6">
        {/* Warning Header */}
        <div className={`p-4 rounded-lg border ${
          isKick 
            ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700'
            : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'
        }`}>
          <div className="flex items-center gap-3">
            <FiAlertTriangle 
              size={24} 
              className={isKick ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'} 
            />
            <div>
              <h3 className={`font-semibold ${
                isKick ? 'text-orange-800 dark:text-orange-300' : 'text-red-800 dark:text-red-300'
              }`}>
                {actionText} User Confirmation
              </h3>
              <p className={`text-sm ${
                isKick ? 'text-orange-700 dark:text-orange-400' : 'text-red-700 dark:text-red-400'
              }`}>
                {isKick 
                  ? 'This user will be removed from the room but can rejoin later.'
                  : 'This user will be permanently banned from this room.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Avatar
            width="w-12"
            height="h-12"
            avatarUrl={avatarUrl || defaultAvatar}
            alt={username}
          />
          <div>
            <div className="flex items-center gap-2">
              <FiUser size={16} className="text-gray-500 dark:text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                {username}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Target user for {type} action
            </p>
          </div>
        </div>

        {/* Reason Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for {type} <span className="text-red-500">*</span>
            </label>
            <CustomInput
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Enter reason for ${type}ing ${username}...`}
              className="w-full"
              disabled={loading}
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Provide a clear reason for this action. This will be visible to the user.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <CustomButton
              text="Cancel"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            />
            <CustomButton
              text={loading ? `${actionText}ing...` : `${actionText} User`}
              variant={isKick ? "warning" : "danger"}
              type="submit"
              disabled={!reason.trim() || loading}
              icon={loading ? undefined : <FiUserX />}
              className={`${
                isKick 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            />
          </div>
        </form>

        {/* Additional Info */}
        <div className="text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="font-medium mb-1">⚠️ Important:</p>
          <ul className="space-y-1">
            {isKick ? (
              <>
                <li>• User will be immediately removed from the room</li>
                <li>• They can rejoin using the room code</li>
                <li>• All participants will see a notification</li>
              </>
            ) : (
              <>
                <li>• User will be permanently banned from this room</li>
                <li>• They cannot rejoin even with the room code</li>
                <li>• You can unban them later in room settings</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </CustomModal>
  );
};

export default KickBanUserModal;