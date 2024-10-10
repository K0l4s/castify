import React from 'react';

interface ToastProps {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info'; // Loại toast
  onClose: (id: string) => void; // Hàm callback khi toast bị đóng
}

const Toast: React.FC<ToastProps> = ({ id, message, type = 'info', onClose }) => {
  return (
    <div
      className={`px-4 py-2 rounded shadow-lg animate-fade-in-out ${
        type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
      } text-white relative`}
    >
      <span>{message}</span>
      <button
        onClick={() => onClose(id)}
        className="absolute top-0 right-0 p-1 text-white hover:text-gray-300"
      >
        &times;
      </button>
    </div>
  );
};

export default Toast;
