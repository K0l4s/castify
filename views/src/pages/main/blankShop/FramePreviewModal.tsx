import CustomModal from '../../../components/UI/custom/CustomModal';
import Avatar from '../../../components/UI/user/Avatar';
import defaultAvatar from '../../../assets/images/default_avatar.jpg';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { useState } from 'react';

interface FramePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    frameImage: string;
    frameName: string;
}

const FramePreviewModal = ({ isOpen, onClose, frameImage, frameName }: FramePreviewModalProps) => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [avatarScale, setAvatarScale] = useState(1);

    const handleZoomIn = () => {
        setAvatarScale(prev => Math.min(prev + 0.1, 1.5));
    };

    const handleZoomOut = () => {
        setAvatarScale(prev => Math.max(prev - 0.1, 0.5));
    };

    return (
        <CustomModal isOpen={isOpen} onClose={onClose} title={frameName}>
            <div className="p-6">
                <div className="flex flex-col items-center gap-6">
                    {/* Preview với avatar của user */}
                    <div className="w-64 h-64">
                        <Avatar
                            src={user?.avatarUrl || defaultAvatar}
                            width="64"
                            height="64"
                            frameSrc={frameImage}
                            avatarScale={avatarScale}
                        />
                    </div>
                    
                    {/* Zoom controls */}
                    <div className="flex items-center gap-4 mt-4">
                        <button 
                            onClick={handleZoomOut}
                            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            Zoom Out
                        </button>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {Math.round(avatarScale * 100)}%
                        </span>
                        <button 
                            onClick={handleZoomIn}
                            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            Zoom In
                        </button>
                    </div>
                </div>
            </div>
        </CustomModal>
    );
};

export default FramePreviewModal; 