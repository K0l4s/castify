import { axiosInstance, axiosInstanceAuth } from '../utils/axiosInstance';
import { Frame, FrameCreateUpdate } from '../models/FrameModel';

//Lấy tất cả các Frame, tất cả các trạng thái (cho trang MyShop)
export const getAllFrames = async () => {
  try {
    const response = await axiosInstanceAuth.get('/api/admin/v1/frame/all');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAcceptedFrames = async () => {
  try {
    const response = await axiosInstanceAuth.get('/api/v1/frame/all');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const uploadFrame = async (frameData: FormData) => {
  try {
    const response = await axiosInstanceAuth.post('/api/v1/frame/upload', frameData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateFrame = async (id: string, frameData: FrameCreateUpdate) => {
  try {
    const response = await axiosInstanceAuth.put(`/api/v1/frame/update/${id}`, frameData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteFrame = async (id: string) => {
  try {
    const response = await axiosInstanceAuth.delete(`/api/v1/frame/delete/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 