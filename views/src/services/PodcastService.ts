import { axiosInstanceFile } from "../utils/axiosInstance";

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
    const response = await axiosInstanceFile.post("/api/v1/podcast/create", formData);
    return response.data;
  } catch (error) {
    throw error;
  }
};