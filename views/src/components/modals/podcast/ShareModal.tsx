import React from 'react';
import CustomModal from '../../UI/custom/CustomModal';
import { useToast } from '../../../context/ToastProvider';
import CustomButton from '../../UI/custom/CustomButton';
import { FaRegCopy } from 'react-icons/fa';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  podcastLink: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, podcastLink }) => {
  const toast = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(podcastLink);
    toast.success('Link copied to clipboard!');
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Share"
      size="md"
      animation='zoom'
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Podcast Link</label>
          <input
            type="text"
            readOnly
            value={podcastLink}
            className="bg-white w-full px-4 py-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <CustomButton
            text='Copy'
            icon={<FaRegCopy />}
            onClick={handleCopyLink}
          />
        </div>
      </div>
    </CustomModal>
  );
};

export default ShareModal;