import React, { useState } from 'react';
import { ReportRequest, ReportType } from '../../../models/Report';
import { reportService } from '../../../services/ReportService';
import CustomModal from '../../UI/custom/CustomModal';
import { useToast } from '../../../context/ToastProvider';
import { useLanguage } from '../../../context/LanguageContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;  // ID của người dùng, podcast, hoặc comment cần báo cáo
  reportType: ReportType;  // Loại báo cáo (USER, PODCAST, COMMENT)
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, targetId, reportType }) => {
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const {language} = useLanguage();
  const handleSubmit = async () => {
    if (!title || !detail) {
      setError('Please fill in all fields');
      return;
    }
    setError(null);
    setIsLoading(true);

    const report: ReportRequest = {
      title,
      detail,
      type: reportType,
      target: targetId,
    };
    
    try {
      await reportService.senReport(report);
      setIsLoading(false);
      onClose();
      toast.success('Send report successfully');
    } catch (error) {
      setIsLoading(false);
      setError('Send report failed');

    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={language.reportModal.header}
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="report-title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{language.reportModal.title}</label>
          <input
            id="report-title"
            type="text"
            className="w-full px-4 py-2 mt-1 border rounded-md bg-white dark:bg-gray-700 dark:text-gray-100"
            placeholder={language.reportModal.titlePlaceholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="report-detail" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{language.reportModal.content}</label>
          <textarea
            id="report-detail"
            className="w-full px-4 py-2 mt-1 border rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 h-32 resize-none"
            placeholder={language.reportModal.contentPlaceholder}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500"
            onClick={onClose}
          >
            {language.common.cancel}
          </button>
          <button
            className={`px-4 py-2 text-white rounded-md ${isLoading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'}`}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "loading ..." : language.common.send}
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default ReportModal;
