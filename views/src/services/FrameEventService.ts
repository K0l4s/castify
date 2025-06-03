import { CreateFrameEventModel } from "../models/FrameModel";
import { axiosInstanceAuth } from "../utils/axiosInstance";

export const createFrameEvent = async (data: CreateFrameEventModel, images: File[]) => {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
  images.forEach((file) => formData.append("images", file));

  try {
    const response = await axiosInstanceAuth.post("/api/admin/v1/frame/event/create", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
