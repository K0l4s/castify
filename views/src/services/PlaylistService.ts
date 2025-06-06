import { CreatePlaylistDTO, PlaylistItem, PlaylistModel } from "../models/PlaylistModel";
import { axiosInstance, axiosInstanceAuth } from "../utils/axiosInstance";

export default class PlaylistService {
  static async getAuthUserPlaylist(
    sortBy: string = "updatedAt",
    order: string = "desc"
  ): Promise<PlaylistModel[]> {
    const response = await axiosInstanceAuth.get(`/api/v1/playlist/user`, {
      params: { sortBy, order },
    });

    const rawData = response.data;

    const mappedData: PlaylistModel[] = rawData.map((playlist: any) => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      thumbnail: playlist.items?.[0]?.thumbnail ?? null,
      totalItems: playlist.items?.length ?? 0,
      publish: playlist.publish,
      lastUpdated: playlist.lastUpdated,
      createdAt: playlist.createdAt,
      owner: {
        id: playlist.owner?.id,
        firstName: playlist.owner?.firstName,
        middleName: playlist.owner?.middleName,
        lastName: playlist.owner?.lastName,
        avatarUrl: playlist.owner?.avatarUrl,
      },
      items: playlist.items?.map((item: any, index: number): PlaylistItem => ({
        podcastId: item.podcastId,
        thumbnail: item.thumbnail,
        duration: item.duration,
        title: item.title,
        description: item.description,
        owner: item.owner,
        order: item.order ?? index,
      })) ?? [],
      hiddenCount: playlist.hiddenCount
    }));

    return mappedData;
  }

  static async getPublicPlaylists(userId: string): Promise<PlaylistModel[]> {
    const response = await axiosInstance.get(`/api/v1/playlist/public/${userId}`);

    const rawData = response.data;

    const mappedData: PlaylistModel[] = rawData.map((playlist: any) => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      thumbnail: playlist.items?.[0]?.thumbnail ?? null,
      totalItems: playlist.items?.length ?? 0,
      publish: playlist.publish,
      lastUpdated: playlist.lastUpdated,
      createdAt: playlist.createdAt,
      owner: {
        id: playlist.owner?.id,
        firstName: playlist.owner?.firstName,
        middleName: playlist.owner?.middleName,
        lastName: playlist.owner?.lastName,
        avatarUrl: playlist.owner?.avatarUrl,
      },
      items: playlist.items?.map((item: any, index: number): PlaylistItem => ({
        podcastId: item.podcastId,
        thumbnail: item.thumbnail,
        duration: item.duration,
        title: item.title,
        description: item.description,
        owner: item.owner,
        order: item.order ?? index,
      })) ?? [],
    }));

    return mappedData;
  }

  static async updatePlaylist(
    id: string,
    name: string,
    description: string,
    publish: boolean
  ): Promise<PlaylistModel> {
    const response = await axiosInstanceAuth.put(`/api/v1/playlist/${id}`, null, {
      params: { name, description, publish },
    });
    
    const playlist = response.data;

    // Map the response
    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      publish: playlist.publish,
      createdAt: playlist.createdAt,
      lastUpdated: playlist.lastUpdated,
      owner: playlist.owner,
      thumbnail: playlist.items?.[0]?.thumbnail ?? null,
      totalItems: playlist.items?.length ?? 0,
      items: playlist.items?.map((item: any, index: number) => ({
        podcastId: item.podcastId,
        thumbnail: item.thumbnail,
        duration: item.duration,
        order: item.order ?? index,
      })) ?? [],
      hiddenCount: playlist.hiddenCount
    };
  }

  static async deletePlaylist(id: string): Promise<void> {
    await axiosInstanceAuth.delete(`/api/v1/playlist/${id}`);
  }

  static async addPodcastToPlaylist(
    playlistId: string,
    podcastId: string
  ): Promise<PlaylistModel> {
    return await axiosInstanceAuth.post(`/api/v1/playlist/${playlistId}/add`, null, {
      params: { podcastId },
    });
  }

  static async removePodcastToPlaylist(
    playlistId: string,
    podcastId: string
  ): Promise<PlaylistModel> {
    return await axiosInstanceAuth.delete(`/api/v1/playlist/${playlistId}/remove`, {
      params: { podcastId },
    });
  }

  static async createPlaylist(
    dto: CreatePlaylistDTO
  ): Promise<PlaylistModel> {
    const response = await axiosInstanceAuth.post(`/api/v1/playlist`, dto);
    
    const playlist = response.data;
  
    // Map the response
    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      publish: playlist.publish,
      createdAt: playlist.createdAt,
      lastUpdated: playlist.lastUpdated,
      owner: playlist.owner,
      thumbnail: playlist.items?.[0]?.thumbnail ?? null,
      totalItems: playlist.items?.length ?? 0,
      items: playlist.items?.map((item: any, index: number) => ({
        podcastId: item.podcastId,
        thumbnail: item.thumbnail,
        duration: item.duration,
        order: item.order ?? index,
      })) ?? [],
      hiddenCount: playlist.hiddenCount
    };
  }

  static async getPlaylistById(id: string, isAuthenticated: boolean): Promise<PlaylistModel> {
    let response = null;
    if (isAuthenticated) {
      response = await axiosInstanceAuth.get(`/api/v1/playlist/${id}`);
    } else {
      response = await axiosInstance.get(`/api/v1/playlist/${id}`);
    }
    
    const playlist = response.data;
  
    // Map the response
    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      publish: playlist.publish,
      createdAt: playlist.createdAt,
      lastUpdated: playlist.lastUpdated,
      owner: playlist.owner,
      thumbnail: playlist.items?.[0]?.thumbnail ?? null,
      totalItems: playlist.items?.length ?? 0,
      items: playlist.items?.map((item: any, index: number) => ({
        podcastId: item.podcastId,
        thumbnail: item.thumbnail,
        duration: item.duration,
        title: item.title,
        description: item.description,
        owner: item.owner,
        order: item.order ?? index,
      })) ?? [],
      hiddenCount: playlist.hiddenCount
    };
  }

  // Add this method to your PlaylistService class
  static async reorderPlaylistItems(
    playlistId: string,
    podcastIds: string[]
  ): Promise<PlaylistModel> {
    const response = await axiosInstanceAuth.post(`/api/v1/playlist/reorder`, {
      playlistId,
      podcastIds
    });
    
    const playlist = response.data;

    // Map the response
    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      publish: playlist.publish,
      createdAt: playlist.createdAt,
      lastUpdated: playlist.lastUpdated,
      owner: playlist.owner,
      thumbnail: playlist.items?.[0]?.thumbnail ?? null,
      totalItems: playlist.items?.length ?? 0,
      items: playlist.items?.map((item: any, index: number) => ({
        podcastId: item.podcastId,
        thumbnail: item.thumbnail,
        duration: item.duration,
        title: item.title,
        description: item.description,
        owner: item.owner,
        order: item.order ?? index,
      })) ?? [],
      hiddenCount: playlist.hiddenCount
    };
  }
}