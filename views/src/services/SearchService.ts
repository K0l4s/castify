import { axiosInstance, axiosInstanceAuth } from '../utils/axiosInstance';
import { Podcast } from '../models/PodcastModel';
import { UserSimple } from '../models/User';
import { PlaylistItem, PlaylistModel } from '../models/PlaylistModel';
import { WatchPartyRoom } from '../models/WatchPartyModel';
import { store } from '../redux/store';

export interface SearchKeyword {
  keyword: string;
  searchCount: number;
}

export interface SearchResult {
  keyword: string;
  podcasts: Podcast[];
  users: UserSimple[];
  playlists: PlaylistModel[];
  watchPartyRooms: WatchPartyRoom[];
  searchDuration: number;
}

export class SearchService {
  // Helper method to get correct axios instance based on auth status
  private static getAxiosInstance() {
    const state = store.getState();
    const isAuthenticated = state.auth.isAuthenticated;
    return isAuthenticated ? axiosInstanceAuth : axiosInstance;
  }

  // Main search - returns all categories
  static async search(keyword: string): Promise<SearchResult> {
    try {
      const axiosClient = this.getAxiosInstance();
      const response = await axiosClient.get(`/api/v1/search?keyword=${encodeURIComponent(keyword)}`);
      const rawData = response.data;

      const mappedResult: SearchResult = {
        keyword: rawData.keyword,
        podcasts: rawData.podcasts,
        users: rawData.users,
        playlists: rawData.playlists?.map((playlist: any) => ({
          id: playlist.id,
          name: playlist.name,
          description: playlist.description,
          thumbnail: playlist.thumbnail || playlist.items?.[0]?.thumbnail || null,
          totalItems: playlist.totalItems || playlist.items?.length || 0,
          publish: playlist.publish,
          lastUpdated: playlist.lastUpdated,
          createdAt: playlist.createdAt,
          owner: {
            id: playlist.owner?.id,
            username: playlist.owner?.username,
            fullname: playlist.owner?.fullname,
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
          hiddenCount: playlist.hiddenCount || 0
        })) || [],
        watchPartyRooms: rawData.watchPartyRooms,
        searchDuration: rawData.searchDuration
      };

      return mappedResult;
    } catch (error) {
      console.error('Error during search:', error);
      throw new Error('Failed to search');
    }
  }

  // Get recent search history
   static async getSearchHistory(): Promise<SearchKeyword[]> {
    try {
      const response = await axiosInstanceAuth.get('/api/v1/search/history');
      return response.data;
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  // Get trending keywords (5 items, global)
  static async getTrendingKeywords(): Promise<SearchKeyword[]> {
    try {
      const response = await axiosInstance.get('/api/v1/search/trending');
      return response.data;
    } catch (error) {
      console.error('Error getting trending keywords:', error);
      return [];
    }
  }

  // Get search suggestions based on prefix
  static async getSearchSuggestions(prefix: string): Promise<SearchKeyword[]> {
    try {
      if (!prefix || prefix.trim().length < 2) {
        return [];
      }
      const response = await axiosInstance.get(`/api/v1/search/suggestions?prefix=${encodeURIComponent(prefix)}`);
      return response.data;
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  // Delete specific history item
  static async deleteHistoryItem(keyword: string): Promise<void> {
    try {
      await axiosInstanceAuth.delete(`/api/v1/search/history?keyword=${encodeURIComponent(keyword)}`);
    } catch (error) {
      console.error('Error deleting history item:', error);
      throw new Error('Failed to delete history item');
    }
  }

  // Clear all search history
  static async clearAllHistory(): Promise<void> {
    try {
      await axiosInstanceAuth.delete('/api/v1/search/history/all');
    } catch (error) {
      console.error('Error clearing all history:', error);
      throw new Error('Failed to clear history');
    }
  }
}