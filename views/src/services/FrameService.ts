import { axiosInstance, axiosInstanceAuth, axiosInstanceFile } from '../utils/axiosInstance';
import {
  Frame
  //, FrameCreateUpdate 
} from '../models/FrameModel';

// For BlankShop
//  Get all accepted frames for public view
export const getAcceptedFrames = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/frame/all');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Purchase frame
export const purchaseFrame = async (frameId: string, voucherCode?: string): Promise<Frame> => {
  try {
    let response;
    if (voucherCode)
      response = await axiosInstanceAuth.post(`/api/v1/frame/purchase/${frameId}?voucherCode=${voucherCode}`);
    else
      response = await axiosInstanceAuth.post(`/api/v1/frame/purchase/${frameId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


// For MyShop
// Get all frames of current user
export const getMyUploads = async () => {
  try {
    const response = await axiosInstanceAuth.get('/api/v1/frame/my-uploads');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Upload new frame
export const uploadFrame = async (frameData: FormData) => {
  try {
    const response = await axiosInstanceFile.post('/api/v1/frame/upload', frameData);
    return response.data;
  } catch (error) {
    console.error('Upload frame error:', error);
    throw error;
  }
};


// For PurchasedFrames
// Get all frames that user has purchased
export const getPurchasedFrames = async () => {
  try {
    const response = await axiosInstanceAuth.get('/api/v1/frame/purchased');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// For AdminFrameManagement - Get all frames from all users
export const getAllFrames = async () => {
  try {
    const response = await axiosInstanceAuth.get('/api/admin/v1/frame/all');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update frame (including status)
export const updateFrame = async (id: string, name: string, price: number) => {
  try {
    const params = new URLSearchParams();
    params.append('name', name);
    params.append('price', price.toString());

    const response = await axiosInstanceAuth.put(`/api/v1/frame/update/${id}?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete frame
export const deleteFrame = async (id: string) => {
  try {
    const response = await axiosInstanceAuth.delete(`/api/v1/frame/delete/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const applyFrame = async (id: string) => {
  try {
    const response = await axiosInstanceAuth.put(`/api/v1/frame/apply/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const cancelCurrentFrame = async () => {
  try {
    const response = await axiosInstanceAuth.delete(`/api/v1/frame/cancel`);
    return response.data;
  } catch (error) {
    throw error;
  }
};