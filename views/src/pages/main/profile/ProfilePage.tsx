import React, { useEffect, useState, useRef, useCallback } from "react";
import ProfileMainContent from "../../../components/main/profile/ProfileMainContent";
import CustomButton from "../../../components/UI/custom/CustomButton";
import { Podcast } from "../../../models/PodcastModel";
import { getUserPodcasts } from "../../../services/PodcastService";
import { FiLoader } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import PodcastTag from "../../../components/UI/podcast/PodcastTag";
import ShareModal from "../../../components/modals/podcast/ShareModal";
import ReportModal from "../../../components/modals/report/ReportModal";
import { ReportType } from "../../../models/Report";
import AddToPlaylistModal from "../playlistPage/AddToPlaylistModal";
import not_found_404 from "../../../assets/images/not_found_404.png";
import PlaylistService from "../../../services/PlaylistService";
import { PlaylistModel } from "../../../models/PlaylistModel";
import PlaylistItem from "../playlistPage/PlaylistItem";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useToast } from "../../../context/ToastProvider";
import CreatePlaylistModal from "../playlistPage/CreatePlaylistModal";
import ConfirmModal from "../../../components/modals/utils/ConfirmDelete";
import CustomModal from "../../../components/UI/custom/CustomModal";

import { useLanguage } from "../../../context/LanguageContext";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "podcasts";
  const initialSortBy = queryParams.get("sortBy") as 'newest' | 'views' | 'oldest' || 'newest';

  const [activeTab, setActiveTab] = useState<'podcasts' | 'playlists'>(initialTab === 'playlists' ? 'playlists' : 'podcasts');
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistModel[]>([]);
  const [podcastsLoading, setPodcastsLoading] = useState<boolean>(true);
  const [playlistsLoading, setPlaylistsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'newest' | 'views' | 'oldest'>(initialSortBy);

  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedPodcastId, setSelectedPodcastId] = useState<string | null>(null);
  const [openOptionMenuId, setOpenOptionMenuId] = useState<string | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<PlaylistModel | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    publish: false,
  });

  // Refs for infinite scrolling
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const username = location.pathname.split("/")[2];
  
  // Get authentication status from Redux store
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isOwnProfile = isAuthenticated && currentUser?.username === username;

  // Fetch podcasts
  const fetchPodcasts = async (username: string, page: number, sortBy: 'newest' | 'views' | 'oldest') => {
    try {
      if (page === 0) {
        // For initial load, we'll keep the old content visible until new content is loaded
        // This prevents the flickering effect
        if (podcasts.length === 0) {
          setPodcastsLoading(true);
        }
      } else {
        // For pagination, show a loading indicator at the bottom
        setPodcastsLoading(true);
      }
      
      const response = await getUserPodcasts(username, page, 12, sortBy);
      
      setPodcasts((prevPodcasts) => {
        if (page === 0) return response.content;
        
        const newPodcasts = response.content.filter(
          (newPodcast) => !prevPodcasts.some((podcast) => podcast.id === newPodcast.id)
        );
        return [...prevPodcasts, ...newPodcasts];
      });
      
      setTotalPages(response.totalPages);
      setPodcastsLoading(false);
    } catch (error) {
      setError("User not found :(");
      setPodcastsLoading(false);
    }
  };
  
  // Fetch playlists
  const fetchPlaylists = async (username: string) => {
    try {
      // Only show loading state if we don't have playlists yet
      if (playlists.length === 0) {
        setPlaylistsLoading(true);
      }
      
      let playlistData: PlaylistModel[] = [];
      
      // If viewing own profile and authenticated, get all playlists (public and private)
      if (isOwnProfile) {
        playlistData = await PlaylistService.getAuthUserPlaylist();
      } else {
        // Otherwise, get only public playlists
        playlistData = await PlaylistService.getPublicPlaylists(username);
      }
      
      setPlaylists(playlistData);
      setPlaylistsLoading(false);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      setError("Failed to load playlists");
      setPlaylistsLoading(false);
    }
  };

  // Load more podcasts callback for infinite scrolling
  const loadMorePodcasts = useCallback(() => {
    if (!podcastsLoading && currentPage < totalPages - 1) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  }, [podcastsLoading, currentPage, totalPages]);
  
  // Initial data loading based on active tab
  useEffect(() => {
    if (activeTab === 'podcasts') {
      if (currentPage === 0) {
        fetchPodcasts(username, 0, sortBy);
      }
    } else if (activeTab === 'playlists') {
      fetchPlaylists(username);
    }
  }, [username, activeTab, sortBy]);
  
  // Load more podcasts when page changes
  useEffect(() => {
    if (currentPage > 0 && activeTab === 'podcasts') {
      fetchPodcasts(username, currentPage, sortBy);
    }
  }, [currentPage]);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    // Only set up observer for podcast tab
    if (activeTab !== 'podcasts') return;
    
    // Disconnect previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !podcastsLoading && currentPage < totalPages - 1) {
          loadMorePodcasts();
        }
      },
      { threshold: 0.5 }
    );
    
    // Observe the loading element
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMorePodcasts, podcastsLoading, activeTab, totalPages, currentPage]);

  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set("tab", activeTab);
    if (activeTab === 'podcasts') {
      params.set("sortBy", sortBy);
    } else {
      params.delete("sortBy");
    }
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [activeTab, sortBy, navigate, location.pathname]);
  
  const handleSortChange = (newSortBy: 'newest' | 'views' | 'oldest') => {
    if (sortBy !== newSortBy) {
      setSortBy(newSortBy);
      setCurrentPage(0);
      fetchPodcasts(username, 0, newSortBy);
    }
  };

  const handleTabChange = (tab: 'podcasts' | 'playlists') => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setError(null);
      
      // If switching to podcasts and we don't have podcasts yet, fetch them
      if (tab === 'podcasts' && podcasts.length === 0) {
        setCurrentPage(0);
        fetchPodcasts(username, 0, sortBy);
      }
      
      // If switching to playlists and we don't have playlists yet, fetch them
      if (tab === 'playlists' && playlists.length === 0) {
        fetchPlaylists(username);
      }
    }
  };

  const toggleAddToPlaylistModal = (podcastId: string) => {
    setSelectedPodcastId(podcastId);
    setIsPlaylistModalOpen(!isPlaylistModalOpen);
  };

  const toggleReportModal = (podcastId: string) => {
    setSelectedPodcastId(podcastId);
    setIsReportModalOpen(!isReportModalOpen);
  }

  const toggleShareModal = (podcastId: string) => {
    setSelectedPodcastId(podcastId);
    setIsShareModalOpen(!isShareModalOpen);
  }

  const toggleOptionMenu = (podcastId: string) => {
    setOpenOptionMenuId(openOptionMenuId === podcastId ? null : podcastId);
  }

  // Playlist handlers
  const handleEditPlaylist = (playlist: PlaylistModel) => {
    setEditingPlaylist(playlist);
    setEditForm({
      name: playlist.name,
      description: playlist.description || "",
      publish: playlist.publish || false,
    });
    setIsEditModalOpen(true);
  };

  const handleDeletePlaylist = (playlistId: string) => {
    setPlaylistToDelete(playlistId);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDeletePlaylist = async () => {
    if (playlistToDelete) {
      try {
        await PlaylistService.deletePlaylist(playlistToDelete);
        setPlaylists((prev) => prev.filter((playlist) => playlist.id !== playlistToDelete));
        setIsDeleteModalOpen(false);
        toast.success("Playlist deleted successfully");
      } catch (error) {
        console.error("Failed to delete playlist:", error);
        toast.error("Failed to delete playlist");
      }
    }
  };
  
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSavePlaylistChanges = async () => {
    if (editingPlaylist) {
      try {
        const updatedPlaylist = await PlaylistService.updatePlaylist(
          editingPlaylist.id,
          editForm.name,
          editForm.description,
          editForm.publish
        );
        setPlaylists((prev) =>
          prev.map((playlist) =>
            playlist.id === editingPlaylist.id ? updatedPlaylist : playlist
          )
        );
        setIsEditModalOpen(false);
        toast.success("Playlist updated successfully");
      } catch (error) {
        console.error("Failed to update playlist:", error);
        toast.error("Failed to update playlist");
      }
    }
  };

  // Error state
  if (error) {
    return (
      <div className="max-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* <ProfileMainContent /> */}
          <div className="mx-auto flex flex-col items-center">
            <span className="text-black dark:text-white text-lg font-semibold">{error}</span>
            <img src={not_found_404} alt="not_found_error" className="lg:w-[50%] w-full"/>
          </div>
        </div>
      </div>
    );
  }
  // const { language } = useLanguage();
  return (
    <div className="min-h-screen">
     
      <div className="container mx-auto px-4 py-8">
        <ProfileMainContent />

        {/* Tab Navigation */}
        <div className="flex justify-center my-4 p-2 rounded-lg">
          <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-xl">
            <button
              onClick={() => handleTabChange('podcasts')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'podcasts'
                  ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Podcasts
            </button>
            <button
              onClick={() => handleTabChange('playlists')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'playlists'
                  ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Playlists
            </button>
          </div>
        </div>
        
        {/* Content based on active tab */}
        {activeTab === 'podcasts' ? (
          <>
            {/* Podcast sorting options */}
            <div className="flex justify-center gap-4 mb-8 p-2 bg-white dark:bg-gray-800 backdrop-blur-sm rounded-3xl shadow-xl mt-5">
              <CustomButton 
                variant={sortBy === 'newest' ? 'primary' : 'secondary'} 
                onClick={() => handleSortChange('newest')}
              >
                Newest
              </CustomButton>
              <CustomButton 
                variant={sortBy === 'views' ? 'primary' : 'secondary'} 
                onClick={() => handleSortChange('views')}
              >
                Views
              </CustomButton>
              <CustomButton 
                variant={sortBy === 'oldest' ? 'primary' : 'secondary'} 
                onClick={() => handleSortChange('oldest')}
              >
                Oldest
              </CustomButton>
            </div>
            
            {/* Fixed height container to prevent layout shifts */}
            <div className="min-h-[80vh]" style={{ minHeight: podcasts.length > 0 ? "auto" : "80vh" }}>
              {/* Only show initial loading state when we have no podcasts */}
              {podcastsLoading && podcasts.length === 0 ? (
                <div className="flex justify-center py-16">
                  <FiLoader size={48} className="text-blue-500 animate-spin"/>
                </div>
              ) : podcasts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No podcasts found</p>
                  <p className="text-gray-600 dark:text-gray-500 text-sm">This user hasn't uploaded any podcasts yet.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-6">
                  {podcasts.map((podcast) => (
                    <PodcastTag
                      key={podcast.id}
                      podcast={podcast}
                      onReport={() => toggleReportModal(podcast.id)}
                      onAddToPlaylist={() => toggleAddToPlaylistModal(podcast.id)}
                      onShare={() => toggleShareModal(podcast.id)}
                      onToggleOptionMenu={toggleOptionMenu}
                      isOptionMenuOpen={openOptionMenuId === podcast.id}
                    />
                  ))}
                </div>
              )}
              
              {/* Infinite scroll loading indicator and detector */}
              <div ref={loadMoreRef} className="h-20 flex items-center justify-center mt-6">
                {podcastsLoading && podcasts.length > 0 && (
                  <div className="flex items-center justify-center">
                    <FiLoader size={30} className="text-blue-500 animate-spin"/>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Playlists grid with fixed height container */}
            <div className="min-h-[80vh]" style={{ minHeight: playlists.length > 0 ? "auto" : "80vh" }}>
              {playlistsLoading && playlists.length === 0 ? (
                <div className="flex justify-center py-16">
                  <FiLoader size={48} className="text-blue-500 animate-spin"/>
                </div>
              ) : playlists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No playlists found</p>
                  <p className="text-gray-600 dark:text-gray-500 text-sm">
                    {isOwnProfile 
                      ? "You haven't created any playlists yet." 
                      : "This user hasn't created any public playlists yet."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {playlists.map((playlist) => (
                    <PlaylistItem 
                      key={playlist.id} 
                      playlist={playlist}
                      onEdit={handleEditPlaylist}
                      onDelete={handleDeletePlaylist}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Modals */}
        {selectedPodcastId && (
          <>
            <AddToPlaylistModal
              isOpen={isPlaylistModalOpen}
              onClose={() => setIsPlaylistModalOpen(false)}
              podcastId={selectedPodcastId}
            />
            
            <ShareModal
              isOpen={isShareModalOpen}
              onClose={() => setIsShareModalOpen(false)}
              podcastLink={`${window.location.origin}/watch?pid=${selectedPodcastId}`}
            />
            
            <ReportModal
              isOpen={isReportModalOpen}
              onClose={() => setIsReportModalOpen(false)}
              targetId={selectedPodcastId}
              reportType={ReportType.P}
            />
          </>
        )}

        {/* Playlist Modals */}
        {/* Edit Playlist Modal */}
        {isEditModalOpen && (
          <CustomModal
            title="Edit Playlist"
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            size="md"
          >
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                  className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditFormChange}
                  rows={3}
                  className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Visibility
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="publish"
                      value="true"
                      checked={editForm.publish === true}
                      onChange={() => setEditForm((prev) => ({ ...prev, publish: true }))}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Public</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="publish"
                      value="false"
                      checked={editForm.publish === false}
                      onChange={() => setEditForm((prev) => ({ ...prev, publish: false }))}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Private</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <CustomButton
                  text="Cancel"
                  variant="ghost"
                  onClick={() => setIsEditModalOpen(false)}
                />
                <CustomButton
                  text="Save Changes"
                  variant="primary"
                  onClick={handleSavePlaylistChanges}
                />
              </div>
            </div>
          </CustomModal>
        )}
        
        {/* Confirm Delete Modal */}
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          title="Are you sure you want to delete this playlist?"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDeletePlaylist}
        />
        
        {/* Create Playlist Modal */}
        <CreatePlaylistModal 
          isOpen={isCreatePlaylistModalOpen} 
          onClose={() => setIsCreatePlaylistModalOpen(false)}
          onPlaylistCreated={() => fetchPlaylists(username)}
        />
      </div>
    </div>
  );
};

export default ProfilePage;