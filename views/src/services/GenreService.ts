import { axiosInstance, axiosInstanceAuth } from '../utils/axiosInstance';
import { Genre, genreCreateUpdate } from '../models/GenreModel';

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

export const createGenre = async (data: genreCreateUpdate) => {
  try {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.image) {
      formData.append('image', data.image);
    }
    const response = await axiosInstanceAuth.post('/api/v1/genre/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateGenre = async (id: string, data: genreCreateUpdate) => {
  try {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.image) {
      formData.append('image', data.image);
    }
    const response = await axiosInstanceAuth.put(`/api/v1/genre/update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

export const getTotalActiveGenresCount = async () => {
  try {
    const response = await axiosInstanceAuth.get('/api/v1/genre/countActiveGenres');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// export const getMostUsedGenres = async () => {
//   try {
//     const response = await axiosInstanceAuth.get('/api/v1/genre/mostUsed');
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const getGenreCountByDate = async () => {
//   try {
//     const response = await axiosInstanceAuth.get('/api/v1/genre/countByDate');
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };
