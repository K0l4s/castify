import React, { createContext, useContext, useState } from 'react';
import { Podcast } from '../models/PodcastModel';
import { getSelfPodcastsInCreator } from '../services/PodcastService';

interface PodcastContextProps {
  podcasts: Podcast[];
  currentPage: number;
  totalPages: number;
  fetchPodcasts: (page?: number, size?: number, sortByViews?: string, sortByComments?: string, sortByCreatedDay?: string) => void;
}

const PodcastContext = createContext<PodcastContextProps | undefined>(undefined);

export const PodcastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPodcasts = async (page = 0, size = 5, sortByViews = 'asc', sortByComments = 'asc', sortByCreatedDay = 'desc') => {
    // console.log('fetchPodcasts called with:', { page, size, sortByViews, sortByComments, sortByCreatedDay });
    try {
      const data = await getSelfPodcastsInCreator(page, size, undefined, undefined, sortByViews, sortByComments, sortByCreatedDay);
      setPodcasts(data.content);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching podcasts:', error);
    }
  };
  
  return (
    <PodcastContext.Provider value={{ podcasts, currentPage, totalPages, fetchPodcasts }}>
      {children}
    </PodcastContext.Provider>
  );
};

export const usePodcastContext = () => {
  const context = useContext(PodcastContext);
  if (!context) {
    throw new Error('usePodcastContext must be used within a PodcastProvider');
  }
  return context;
};