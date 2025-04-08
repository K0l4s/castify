import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import coin from '../../../assets/images/coin.png';

interface PurchaseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  frameName: string;
  frameImage: string;
  framePrice: number;
  purchasing?: boolean;
}

const PurchaseConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  frameName,
  frameImage,
  framePrice,
  purchasing = false,
}: PurchaseConfirmationModalProps) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
                >
                  Confirm Purchase
                </Dialog.Title>

                <div className="mt-2">
                  <div className="relative aspect-square mb-4">
                    <img
                      src={frameImage}
                      alt={frameName}
                      className="w-full h-full object-contain p-4"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Frame Name: <span className="font-medium text-gray-900 dark:text-white">{frameName}</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Price: <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                        {framePrice}
                        <img src={coin} alt="coin" className="w-4 h-4" />
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onConfirm}
                    disabled={purchasing}
                  >
                    {purchasing ? 'Processing...' : 'Confirm Purchase'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PurchaseConfirmationModal; 