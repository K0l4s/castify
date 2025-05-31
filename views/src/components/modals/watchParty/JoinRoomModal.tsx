import React, { useState } from 'react';
import { WatchPartyRoom } from '../../../models/WatchPartyModel';
import CustomModal from '../../../components/UI/custom/CustomModal';
import CustomButton from '../../../components/UI/custom/CustomButton';
import { FiLoader } from 'react-icons/fi';
// import { useLanguage } from '../../../context/LanguageContext';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roomCode: string) => Promise<WatchPartyRoom | null>;
}

const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const { language } = useLanguage();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Extract code from room code or URL
    let code = roomCode.trim();
    
    // Check if it's a URL and extract the room parameter
    if (code.includes('room=')) {
      const match = code.match(/room=([^&]+)/);
      if (match && match[1]) {
        code = match[1];
      }
    }
    
    if (!code) {
      setError('Please enter a valid room code');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await onSubmit(code);
    } catch (err) {
      setError('Failed to join room. It may no longer exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomCode(e.target.value);
    setError(null);
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Join Watch Party"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Room Code or Invite Link
          </label>
          <input
            type="text"
            value={roomCode}
            onChange={handleRoomCodeChange}
            placeholder="Enter room code or paste invite link"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Ask the host for the room code or invite link
          </p>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
            {error}
          </div>
        )}
        
        <div className="flex justify-end gap-2 pt-2">
          <CustomButton
            text="Cancel"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          />
          <CustomButton
            text={loading ? 'Joining...' : 'Join Room'}
            type="submit"
            variant="primary"
            disabled={loading || !roomCode.trim()}
            icon={loading ? <FiLoader className="animate-spin" /> : undefined}
          />
        </div>
      </form>
    </CustomModal>
  );
};

export default JoinRoomModal;