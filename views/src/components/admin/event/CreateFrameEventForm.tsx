import React, { useState } from "react";
import { CreateFrameEventModel } from "../../../models/FrameModel";
import { createFrameEvent } from "../../../services/FrameEventService";
const CreateFrameEventForm: React.FC = () => {
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
      await createFrameEvent(formData, images);
      alert("Tạo sự kiện thành công!");
      // reset nếu muốn
    } catch (error) {
      console.error("Lỗi tạo sự kiện:", error);
      alert("Đã có lỗi xảy ra khi tạo sự kiện.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold">Tạo Sự Kiện Mới</h2>

      <input
        type="text"
        name="name"
        placeholder="Tên sự kiện"
        value={formData.name}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      />

      <textarea
        name="description"
        placeholder="Mô tả"
        value={formData.description}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      />

      <input
        type="datetime-local"
        name="startDate"
        value={formData.startDate}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      />

      <input
        type="datetime-local"
        name="endDate"
        value={formData.endDate}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      />

      <input
        type="number"
        name="percent"
        placeholder="Phần trăm giảm (nếu có)"
        value={formData.percent ?? ""}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        step="0.1"
        min="0"
        max="100"
      />

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        className="w-full"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {isSubmitting ? "Đang gửi..." : "Tạo sự kiện"}
      </button>
    </form>
  );
};

export default CreateFrameEventForm;
