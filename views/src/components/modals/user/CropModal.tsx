// components/UI/custom/CropModal.tsx
import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import CustomModal from '../../UI/custom/CustomModal';
import { getCroppedImg } from '../../../utils/getCroppedImg';

interface CropModalProps {
    imageSrc: string;
    onClose: () => void;
    onCropComplete: (blob: Blob) => void;
}

const CropModal = ({ imageSrc, onClose, onCropComplete }: CropModalProps) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const handleCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleDone = async () => {
        const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
        onCropComplete(croppedBlob);
        onClose();
    };

    return (
        <CustomModal title="Crop Avatar" isOpen={true} onClose={onClose} size="lg">
            <div className="relative w-full h-96 bg-black">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={handleCropComplete}
                />
            </div>
            <div className="mt-4">
                <div className="mt-4">
                    <label className="block text-sm font-medium text-white mb-2">
                        Zoom: {zoom.toFixed(1)}x
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                    />
                </div>
                <div className="flex justify-end space-x-4 mt-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded">Hủy</button>
                    <button onClick={handleDone} className="px-4 py-2 bg-blue-600 text-white rounded">Xong</button>
                </div>
            </div>
        </CustomModal>
    );
};

export default CropModal;
