import React, { useState } from "react";
import { CreateFrameEventModel } from "../../../models/FrameModel";
import { createFrameEvent } from "../../../services/FrameEventService";
import CustomModal from "../../UI/custom/CustomModal";
interface FrameEvent {
  id: string;
  name: string;
  description: string;
  bannersUrl: string[];
  createDate: string;
  startDate: string;
  endDate: string;
  percent: number;
  active: boolean;
  showEvent: boolean;
}
interface ModalProps {
  onClose: () => void;
  isOpen: boolean;
  setEvents: (events: FrameEvent[] | ((prevEvents: FrameEvent[]) => FrameEvent[])) => void;
}

const CreateFrameEventForm: React.FC<ModalProps> = ({
  onClose,
  isOpen,
  setEvents,
}) => {
  const [formData, setFormData] = useState<CreateFrameEventModel>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    percent: 0,
    active: true,
  });

  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const resp = await createFrameEvent(formData, images);
      setEvents((prevEvents: FrameEvent[]) => [resp, ...prevEvents]);
      setFormData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        percent: 0,
        active: true,
      });
      setImages([]);
      onClose();
    } catch (error) {
      console.error("Lỗi tạo sự kiện:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  return (
    <CustomModal title="Tạo Sự Kiện Mới" onClose={onClose} isOpen={isOpen} size="md">
      {isSubmitting && (
      <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center z-50 rounded-lg">
        <div className="flex flex-col items-center">
        <svg className="animate-spin h-8 w-8 text-blue-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <span className="text-blue-600 font-medium">Đang xử lý...</span>
        </div>
      </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-lg relative text-gray-900 dark:text-gray-100">

      <div>
        <label className="block text-sm font-medium mb-1">Tên sự kiện</label>
        <input
        type="text"
        name="name"
        placeholder="Tên sự kiện"
        value={formData.name}
        onChange={handleChange}
        className="w-full border border-gray-300 dark:border-gray-600 p-1.5 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        required
        disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Mô tả</label>
        <textarea
        name="description"
        placeholder="Mô tả"
        value={formData.description}
        onChange={handleChange}
        className="w-full border border-gray-300 dark:border-gray-600 p-1.5 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        required
        rows={2}
        disabled={isSubmitting}
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
        <label className="block text-sm font-medium mb-1">Bắt đầu</label>
        <input
          type="datetime-local"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          className="w-full border border-gray-300 dark:border-gray-600 p-1.5 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          required
          disabled={isSubmitting}
        />
        </div>
        <div className="flex-1">
        <label className="block text-sm font-medium mb-1">Kết thúc</label>
        <input
          type="datetime-local"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          className="w-full border border-gray-300 dark:border-gray-600 p-1.5 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          required
          disabled={isSubmitting}
        />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Phần trăm giảm</label>
        <input
        type="number"
        name="percent"
        placeholder="%"
        value={formData.percent ?? ""}
        onChange={handleChange}
        className="w-full border border-gray-300 dark:border-gray-600 p-1.5 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        step="0.1"
        min="0"
        max="100"
        disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Ảnh banner</label>
        <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        className="w-full border border-gray-300 dark:border-gray-600 p-1.5 rounded text-sm bg-white dark:bg-gray-800 file:bg-white file:dark:bg-gray-700 file:text-black file:dark:text-white text-gray-900 dark:text-gray-100"
        disabled={isSubmitting}
        />
        {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {images.map((img, idx) => (
          <div key={idx} className="relative group">
            <img
            src={URL.createObjectURL(img)}
            alt={`preview-${idx}`}
            className="w-16 h-16 object-cover rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
            <button
            type="button"
            onClick={() => handleRemoveImage(idx)}
            className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-80 group-hover:opacity-100"
            title="Xóa"
            disabled={isSubmitting}
            >
            &times;
            </button>
          </div>
          ))}
        </div>
        )}

      </div>

      <div className="flex justify-end gap-2 mt-2">
        <button
        type="button"
        onClick={onClose}
        className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-900 dark:text-gray-100"
        disabled={isSubmitting}
        >
        Hủy
        </button>
        <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 transition font-semibold"
        >
        {isSubmitting ? "Đang gửi..." : "Tạo"}
        </button>
      </div>
      </form>
    </CustomModal>
  );
};

export default CreateFrameEventForm;
