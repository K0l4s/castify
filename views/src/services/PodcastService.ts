import { Podcast, PodcastResponse } from "../models/PodcastModel";
import { axiosInstance, axiosInstanceAuth, axiosInstanceFile, BaseApi } from "../utils/axiosInstance";

interface CreatePodcastPayload {
  title: string;
  content: string;
  video: File;
  thumbnail?: File;
  genreIds: string[];
}

export const createPodcast = async (payload: CreatePodcastPayload) => {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("content", payload.content);
  formData.append("video", payload.video);
  if (payload.thumbnail) {
    formData.append("thumbnail", payload.thumbnail);
  }
  payload.genreIds.forEach((id) => formData.append("genreIds", id));

  try {
    const response = await axiosInstanceFile.post(
      "/api/v1/podcast/create",
      formData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePodcast = async (
  id: string,
  title?: string,
  content?: string,
  thumbnail?: File,
  genreIds?: string[]
) => {
  const formData = new FormData();
  if (title) formData.append("title", title);
  if (content) formData.append("content", content);
  if (thumbnail) formData.append("thumbnail", thumbnail);
  if (genreIds) genreIds.forEach((id) => formData.append("genreIds", id));

  try {
    const response = await axiosInstanceFile.put(
      `/api/v1/podcast/edit/${id}`,
      formData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSelfPodcastsInCreator = async (
  page = 0,
  size = 10,
  minViews?: number,
  minComments?: number,
  sortByViews = "asc",
  sortByComments = "asc",
  sortByCreatedDay = "desc"
) => {
  try {
    const response = await axiosInstanceAuth.get<PodcastResponse>(
      "/api/v1/podcast/contents", {
      params: {
        page,
        size,
        minViews,
        minComments,
        sortByViews,
        sortByComments,
        sortByCreatedDay
      }
    });

    response.data.content.forEach(podcast => {
      podcast.videoUrl = `${BaseApi}/api/v1/podcast/video?path=${encodeURIComponent(podcast.videoUrl)}`;
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPodcastById = async (id: string) => {
  try {
    const response = await axiosInstanceAuth.get<Podcast>(`/api/v1/podcast/${id}`);
    response.data.videoUrl = `${BaseApi}/api/v1/podcast/video?path=${encodeURIComponent(response.data.videoUrl)}`;
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPodcastBySelf = async (id: string) => {
  try {
    const response = await axiosInstanceAuth.get<Podcast>(`/api/v1/podcast/detail/${id}`);
    response.data.videoUrl = `${BaseApi}/api/v1/podcast/video?path=${encodeURIComponent(response.data.videoUrl)}`;
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPodcastByAnonymous = async (id: string) => {
  try {
    const response = await axiosInstance.get<Podcast>(`/api/v1/podcast/anonymous/${id}`);
    response.data.videoUrl = `${BaseApi}/api/v1/podcast/video?path=${encodeURIComponent(response.data.videoUrl)}`;
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const likePodcast = async (podcastId: string) => {
  try {
    const response = await axiosInstanceAuth.post(`/api/v1/podcast/reaction`, { podcastId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPodcastRecent = async (page: number, size: number) => {
  try {
    const response = await axiosInstance.get<PodcastResponse>("/api/v1/podcast/recent", {
      params: {
        page,
        size
      }
    });
    response.data.content.forEach(podcast => {
      podcast.videoUrl = `${BaseApi}/api/v1/podcast/video?path=${encodeURIComponent(podcast.videoUrl)}`;
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPodcastPopular = async (page: number, size: number) => {
  try {
    const response = await axiosInstance.get<PodcastResponse>("/api/v1/podcast/popular", {
      params: {
        page,
        size
      }
    });
    response.data.content.forEach(podcast => {
      podcast.videoUrl = `${BaseApi}/api/v1/podcast/video?path=${encodeURIComponent(podcast.videoUrl)}`;
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTrendingPodcast = async (page: number, size: number) => {
  try {
    const response = await axiosInstance.get<PodcastResponse>("/api/v1/podcast/trending", {
      params: {
        page,
        size
      }
    });
    response.data.content.forEach(podcast => {
      podcast.videoUrl = `${BaseApi}/api/v1/podcast/video?path=${encodeURIComponent(podcast.videoUrl)}`;
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const getFollowingPodcast = async (page: number, size: number) => {
  try {
    const response = await axiosInstanceAuth.get<PodcastResponse>("/api/v1/podcast/following", {
      params: {
        page,
        size
      }
    });
    response.data.content.forEach(podcast => {
      podcast.videoUrl = `${BaseApi}/api/v1/podcast/video?path=${encodeURIComponent(podcast.videoUrl)}`;
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getFollowingPodcastByUsername = async (username: string, page: number, size: number) => {
  try {
    const response = await axiosInstanceAuth.get<PodcastResponse>(`/api/v1/podcast/following/${username}`, {
      params: {
        page,
        size
      }
    });
    response.data.content.forEach(podcast => {
      podcast.videoUrl = `${BaseApi}/api/v1/podcast/video?path=${encodeURIComponent(podcast.videoUrl)}`;
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPodcastsByGenre = async (genreId: string, page: number, size: number) => {
  try {
    const response = await axiosInstance.get<PodcastResponse>("/api/v1/podcast/by-genre", {
      params: {
        genreId,
        page,
        size
      }
    });
    response.data.content.forEach(podcast => {
      podcast.videoUrl = `${BaseApi}/api/v1/podcast/video?path=${encodeURIComponent(podcast.videoUrl)}`;
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSuggestedPodcastsByGenres = async (
  id: string,
  genreIds: string[],
  page = 0,
  size = 5
) => {
  try {
    const response = await axiosInstance.get<PodcastResponse>(
      `/api/v1/podcast/suggested-by-genres/${id}`, {
      params: {
        genreIds: genreIds.join(','),
        page,
        size
      }
    });

    response.data.content.forEach(podcast => {
      podcast.videoUrl = `${BaseApi}/api/v1/podcast/video?path=${encodeURIComponent(podcast.videoUrl)}`;
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const incrementPodcastViews = async (podcastId: string) => {
  try {
    const response = await axiosInstance.post(`/api/v1/podcast/${podcastId}/inc-views`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserPodcasts = async (
  username: string,
  page = 0,
  size = 12,
  sortBy: 'newest' | 'oldest' | 'views' = 'newest'
) => {
  try {
    const response = await axiosInstance.get<PodcastResponse>(
      `/api/v1/podcast/user/${username}`, {
      params: {
        page,
        size,
        sortBy
      }
    });

    response.data.content.forEach(podcast => {
      podcast.videoUrl = `${BaseApi}/api/v1/podcast/video?path=${encodeURIComponent(podcast.videoUrl)}`;
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const togglePodcasts = async (podcastIds: string[]) => {
  try {
    const response = await axiosInstanceAuth.put(`/api/v1/podcast/toggle`, podcastIds);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deletePodcasts = async (podcastIds: string[]) => {
  try {
    const response = await axiosInstanceAuth.delete(`/api/v1/podcast/delete`, {
      data: podcastIds
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};