import { axiosInstance, axiosInstanceAuth } from '../utils/axiosInstance';

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

export const getAllGenres = async () => {
  try {
    const response = await axiosInstanceAuth.get('/api/v1/genre/all');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createGenre = async (name: string) => {
  try {
    const response = await axiosInstanceAuth.post('/api/v1/genre/create', { name });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateGenre = async (id: string, name: string) => {
  try {
    const response = await axiosInstanceAuth.put(`/api/v1/genre/update/${id}`, { name });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteGenre = async (id: string) => {
  try {
    const response = await axiosInstanceAuth.put(`/api/v1/genre/delete/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};