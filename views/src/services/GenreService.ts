import { axiosInstance } from '../utils/axiosInstance';

export const getGenres = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/genre/names');
    return response.data;
  } catch (error) {
    throw error;
  }
};