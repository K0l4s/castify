import React from 'react';

type ConfirmBoxProps = {
  title?: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  confirmText?: string;
  cancelText?: string;
  isOpen: boolean;
  className?: string;
};

const ConfirmBox: React.FC<ConfirmBoxProps> = ({
  title = 'Xác nhận',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  onConfirm,
  onCancel,
  onClose,
  confirmText = 'Yes',
  cancelText = 'No',
  isOpen,
  className = '',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm duration-300 ease-in-out">
      <div
        className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg w-96 p-6 ${className}`}
      >
        <h3 className="text-lg font-bold text:black dark:text-white">{title}</h3>
        <p className="mt-4 text-gray-600 dark:text-gray-300">{message}</p>
        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onCancel || onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBox;
