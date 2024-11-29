import { axiosInstanceAuth } from '../utils/axiosInstance';

export const getGenres = async () => {
  try {
    const response = await axiosInstanceAuth.get('/api/v1/genre/names');
    return response.data;
  } catch (error) {
    throw error;
  }
};