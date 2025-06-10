// src/components/modals/comment/EditCommentModal.tsx
import React, { useState } from 'react';
import CustomModal from '../../UI/custom/CustomModal';
import CustomCommentInput from '../../UI/custom/CustomCommentInput';
import { useToast } from '../../../context/ToastProvider';
import { useLanguage } from '../../../context/LanguageContext';

interface EditCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  commentId: string;
  initialContent: string;
  onSave: (commentId: string, content: string) => Promise<void>;
}

const EditCommentModal: React.FC<EditCommentModalProps> = ({
  isOpen,
  onClose,
  commentId,
  initialContent,
  onSave
}) => {
  const {language} = useLanguage();
  const [, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (newContent: string) => {
    if (!newContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    if (newContent.trim() === initialContent.trim()) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(commentId, newContent);
      onClose();
    } catch (error) {
      console.error('Error saving comment:', error);
      toast.error('Failed to update comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomModal
      title={language.common.edit}
      isOpen={isOpen}
      onClose={onClose}
      size="md"
    >
      <div className="py-2 px-4">
        <CustomCommentInput
          initialContent={initialContent}
          onSubmit={handleSubmit}
          placeholder={language.commentSection.editYourComment || 'Edit your comment...'}
          maxLength={2000}
          autoFocus
        />
      </div>
    </CustomModal>
  );
};

export default EditCommentModal;