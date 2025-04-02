import React from 'react';
import CustomModal from '../../UI/custom/CustomModal';
import CustomButton from '../../UI/custom/CustomButton';

interface ConfirmModalProps {
  isOpen: boolean;
  title:string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen,title, onClose, onConfirm }) => {
  return (
    <CustomModal
      title="Confirm Delete"
      isOpen={isOpen}
      onClose={onClose}
      size="md"
    >
      <p>{title}</p>
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

export default ConfirmModal;