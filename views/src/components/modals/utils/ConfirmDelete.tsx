import React from 'react';
import CustomModal from '../../UI/custom/CustomModal';
import CustomButton from '../../UI/custom/CustomButton';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <CustomModal
      title="Confirm Delete"
      isOpen={isOpen}
      onClose={onClose}
      size="md"
    >
      <p>Are you sure you want to delete permanently ?</p>
      <div className="flex justify-end gap-4 mt-4">
        <CustomButton 
          text="Cancel" 
          variant="ghost" 
          onClick={onClose}
        />
        <CustomButton 
          text="Delete" 
          variant="primary" 
          onClick={onConfirm} 
          className='bg-red-500 dark:bg-red-600 hover:bg-red-600 hover:dark:bg-red-500'
        />
      </div>
    </CustomModal>
  );
};

export default ConfirmDeleteModal;