import { Podcast, PodcastResponse } from "../models/PodcastModel";
import { axiosInstanceAuth, axiosInstanceFile } from "../utils/axiosInstance";

interface CreatePodcastPayload {
  title: string;
  content: string;
  video: File;
}

export const createPodcast = async (payload: CreatePodcastPayload) => {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("content", payload.content);
  formData.append("video", payload.video);

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

    response.data.podcasts.forEach(podcast => {
      podcast.videoUrl = `http://localhost:8081/api/v1/podcast/video?path=${encodeURIComponent(podcast.videoUrl)}`;
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPodcastById = async (id: string) => {
  try {
    const response = await axiosInstanceAuth.get<Podcast>(`/api/v1/podcast/${id}`);
    response.data.videoUrl = `http://localhost:8081/api/v1/podcast/video?path=${encodeURIComponent(response.data.videoUrl)}`;
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPodcastComments = async (podcastId: string) => {
  try {
    const response = await axiosInstanceAuth.get(`/api/v1/comment/list/${podcastId}`);
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