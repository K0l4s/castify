import { axiosInstanceAuth, axiosInstanceFile } from '../utils/axiosInstance';
import {
  Frame
  //, FrameCreateUpdate 
} from '../models/FrameModel';

// For BlankShop
//  Get all accepted frames for public view
export const getAcceptedFrames = async () => {
  try {
    const response = await axiosInstanceAuth.get('/api/v1/frame/all');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Purchase frame
export const purchaseFrame = async (
  frameId: string,
  voucherCode?: string,
  eventId?: string
) => {
  try {
    const queryParams = new URLSearchParams();

    if (voucherCode) queryParams.append("voucherCode", voucherCode);
    if (eventId) queryParams.append("eventId", eventId);

    const url =
      queryParams.toString().length > 0
        ? `/api/v1/frame/purchase/${frameId}?${queryParams.toString()}`
        : `/api/v1/frame/purchase/${frameId}`;

    const response = await axiosInstanceAuth.post(url);
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

export const giftFrame = async (
  awardeeId: string,
  frameId: string,
  voucherCode?: string,
  eventId?: string
) => {
  try {
    console.log('Gifting frame:', {
      awardeeId,
      frameId,
      voucherCode,
      eventId,
    });
    const response = await axiosInstanceAuth.post(
      `/api/v1/frame/gift`,
      {}, // body rỗng
      {
        params: {
          awareeId: awardeeId,
          frameId: frameId,
          voucherCode: voucherCode,
          eventId: eventId,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getVoucher = async (code: string) => {
  try {
    const response = await axiosInstanceAuth.get(`/api/v1/frame/voucher`,
      { params: { code } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};