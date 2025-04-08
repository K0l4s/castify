import { axiosInstance, axiosInstanceAuth } from '../utils/axiosInstance';
import { Frame
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
export const purchaseFrame = async (frameId: string): Promise<Frame> => {
  try {
    const response = await axiosInstanceAuth.post(`/api/v1/frame/purchase/${frameId}`);
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
export const updateFrame = async (id: string, 
  frameData: any//Partial<FrameCreateUpdate>

) => {
  try {
    const response = await axiosInstanceAuth.put(`/api/v1/frame/update/${id}`, frameData);
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