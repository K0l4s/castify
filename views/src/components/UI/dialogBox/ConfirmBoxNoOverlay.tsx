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

const ConfirmBoxNoOverlay: React.FC<ConfirmBoxProps> = ({
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
        <div className="fixed left-5 bottom-5 z-50">
            <div
                className={`bg-green-200/90 gap-2 dark:bg-gray-900 rounded-lg shadow-lg w-full p-6 ${className} border-3 border-green-300 dark:border-gray-700`}
            >
                <h3 className="text-lg font-bold text-black dark:text-white">{title}</h3>
                <div className='flex items-center gap-2 justify-between'>
                    <p className=" text-gray-600 dark:text-gray-300">{message}</p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onCancel || onClose}
                            className="px-4 py-2 text-gray-700 bg-red-200 rounded hover:bg-red-300"
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
        </div>
    );
};

export default ConfirmBoxNoOverlay;
