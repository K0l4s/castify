import { CreateFrameEventModel } from "../models/FrameModel";
import { axiosInstance, axiosInstanceAuth } from "../utils/axiosInstance";

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

export const getCurrentActiveFrame = async () => {

  try {
    const response = await axiosInstance.get("/api/v1/frame/event",);
    return response.data;
  } catch (error) {
    throw error;
  }
};