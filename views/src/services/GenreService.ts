import { axiosInstance } from '../utils/axiosInstance';

export const getGenres = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/genre/names');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getGenresByList = async (genreIds: string[]) => {
  try {
    const response = await axiosInstance.post('/api/v1/genre/namesByList', genreIds);
    return response.data;
  } catch (error) {
    throw error;
  }
};