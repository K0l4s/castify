import { PlaylistModel } from "../models/PlaylistModel";
import { axiosInstanceAuth } from "../utils/axiosInstance";

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
      thumbnail: playlist.items?.[0]?.thumbnail ?? null, // lấy thumbnail đầu tiên nếu có
      totalItems: playlist.items?.length ?? 0,
      publish: playlist.publish,
      lastUpdated: playlist.lastUpdated,
    }));

    return mappedData;
  }
}