import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SearchService, SearchResult } from "../../../services/SearchService";
import PodcastTag from "../../UI/podcast/PodcastTag";
import UserCard from "../../UI/user/UserCard";
import PlaylistItem from "../../../pages/main/playlistPage/PlaylistItem";
import RoomCard from "../../modals/watchParty/RoomCard";
import { FiMic, FiUsers, FiList, FiPlay, FiSearch } from "react-icons/fi";
// import { useLanguage } from "../../../context/LanguageContext";
import { Podcast } from "../../../models/PodcastModel";
import { useToast } from "../../../context/ToastProvider";
import { RootState } from "../../../redux/store";
import { useSelector } from "react-redux";
import { ReportType } from "../../../models/Report";
import AddToPlaylistModal from "../../../pages/main/playlistPage/AddToPlaylistModal";
import ReportModal from "../../modals/report/ReportModal";
import ShareModal from "../../modals/podcast/ShareModal";
import { UserSimple } from "../../../models/User";
import { useLanguage } from "../../../context/LanguageContext";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
   const toast = useToast();

  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get('keyword') || '';
  
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'podcasts' | 'users' | 'playlists' | 'rooms'>('all');
  const [optionMenuOpen, setOptionMenuOpen] = useState<string | null>(null);

  // Modal states
  const [addToPlaylistModal, setAddToPlaylistModal] = useState<{ isOpen: boolean; podcastId: string }>({
    isOpen: false,
    podcastId: ''
  });
  const [reportModal, setReportModal] = useState<{ isOpen: boolean; targetId: string; type: ReportType }>({
    isOpen: false,
    targetId: '',
    type: ReportType.P
  });
  const [shareModal, setShareModal] = useState<{ isOpen: boolean; link: string }>({
    isOpen: false,
    link: ''
  });

  // Loading states

  // Auth state
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  // const currentUser = useSelector((state: RootState) => state.auth.user);

  // Load search results
  useEffect(() => {
    if (keyword) {
      performSearch();
    }
  }, [keyword]);

  const performSearch = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await SearchService.search(keyword);
      setSearchResult(result);

      const followingSet = new Set<string>();
      result.users.forEach(user => {
        if (user.follow) {
          followingSet.add(user.id);
        }
      });
    } catch (err) {
      setError('Failed to search. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle podcast option menu
  const handleToggleOptionMenu = (podcastId: string) => {
    setOptionMenuOpen(optionMenuOpen === podcastId ? null : podcastId);
  };

  // Handle podcast actions
  const handleReport = (podcastId: string) => {
    setReportModal({
      isOpen: true,
      targetId: podcastId,
      type: ReportType.P
    });
    setOptionMenuOpen(null);
  };

  const handleAddToPlaylist = (podcastId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to add to playlist');
      return;
    }
    setAddToPlaylistModal({
      isOpen: true,
      podcastId
    });
    setOptionMenuOpen(null);
  };

  const handleShare = (podcastId: string) => {
    const podcastLink = `${window.location.origin}/watch?pid=${podcastId}`;
    setShareModal({
      isOpen: true,
      link: podcastLink
    });
    setOptionMenuOpen(null);
  };

  // Handle user updates (từ UserCard callback)
  const handleUserUpdated = (updatedUser: UserSimple) => {
    setSearchResult(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        users: prev.users.map(u => 
          u.id === updatedUser.id ? updatedUser : u
        )
      };
    });
  };

  // Join watch party room
  const handleJoinRoom = (roomCode: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to join watch party');
      return;
    }
    
    navigate(`/watch-party?room=${roomCode}`);
  };

  // Get total results count
  const getTotalResults = () => {
    if (!searchResult) return 0;
    return (
      searchResult.podcasts.length +
      searchResult.users.length +
      searchResult.playlists.length +
      searchResult.watchPartyRooms.length
    );
  };

  // Get filtered results based on active tab
  const getFilteredResults = () => {
    if (!searchResult) return null;
    
    switch (activeTab) {
      case 'podcasts':
        return { podcasts: searchResult.podcasts, users: [], playlists: [], watchPartyRooms: [] };
      case 'users':
        return { podcasts: [], users: searchResult.users, playlists: [], watchPartyRooms: [] };
      case 'playlists':
        return { podcasts: [], users: [], playlists: searchResult.playlists, watchPartyRooms: [] };
      case 'rooms':
        return { podcasts: [], users: [], playlists: [], watchPartyRooms: searchResult.watchPartyRooms };
      default:
        return searchResult;
    }
  };

  const filteredResults = getFilteredResults();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Searching...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FiSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={performSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {language.search.title || 'Search Results'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language.search.found || 'Found'} {getTotalResults()} {language.search.resultsFor || 'results for'} "<span className="font-semibold">{keyword}</span>"
            {searchResult && (
              <span className="ml-2 text-sm">
                ({language.search.searchTook || 'Search took'} {searchResult.searchDuration}ms)
              </span>
            )}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
            {[
              { key: 'all', label: language.search.all || 'All', icon: FiSearch, count: getTotalResults() },
              { key: 'podcasts', label: language.search.podcasts || 'Podcasts', icon: FiMic, count: searchResult?.podcasts.length || 0 },
              { key: 'users', label: language.search.users || 'Users', icon: FiUsers, count: searchResult?.users.length || 0 },
              { key: 'playlists', label: language.search.playlists || 'Playlists', icon: FiList, count: searchResult?.playlists.length || 0 },
              { key: 'rooms', label: language.search.watchParties || 'Watch Parties', icon: FiPlay, count: searchResult?.watchPartyRooms.length || 0 },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
                {tab.count > 0 && (
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {filteredResults && getTotalResults() > 0 ? (
          <div className="space-y-12">
            
            {/* Podcasts Section */}
            {filteredResults.podcasts.length > 0 && (
              <section>
                {activeTab === 'all' && (
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FiMic />
                      {language.search.podcasts || 'Podcasts'} ({filteredResults.podcasts.length})
                    </h2>
                    {searchResult?.podcasts.length && searchResult.podcasts.length > 6 && (
                      <button
                        onClick={() => setActiveTab('podcasts')}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {language.common.viewAll || 'View all'}
                      </button>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 auto-rows-fr">
                  {(activeTab === 'all' ? filteredResults.podcasts.slice(0, 8) : filteredResults.podcasts).map((podcast) => (
                    <div key={podcast.id} className="relative w-full">
                      <PodcastTag
                        podcast={podcast as Podcast}
                        onReport={() => handleReport(podcast.id)}
                        onAddToPlaylist={() => handleAddToPlaylist(podcast.id)}
                        onShare={() => handleShare(podcast.id)}
                        onToggleOptionMenu={handleToggleOptionMenu}
                        isOptionMenuOpen={optionMenuOpen === podcast.id}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Users Section */}
            {filteredResults.users.length > 0 && (
              <section>
                {activeTab === 'all' && (
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FiUsers />
                      {language.search.users || 'Users'} ({filteredResults.users.length})
                    </h2>
                    {searchResult?.users.length && searchResult.users.length > 6 && (
                      <button
                        onClick={() => setActiveTab('users')}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {language.common.viewAll || 'View all'}
                      </button>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {(activeTab === 'all' ? filteredResults.users.slice(0, 6) : filteredResults.users).map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onUserUpdated={handleUserUpdated} // ✅ Đơn giản hơn
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Playlists Section */}
            {filteredResults.playlists.length > 0 && (
              <section>
                {activeTab === 'all' && (
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FiList />
                      {language.search.playlists || 'Playlists'} ({filteredResults.playlists.length})
                    </h2>
                    {searchResult?.playlists.length && searchResult.playlists.length > 6 && (
                      <button
                        onClick={() => setActiveTab('playlists')}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {language.common.viewAll || 'View all'}
                      </button>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                  {(activeTab === 'all' ? filteredResults.playlists.slice(0, 6) : filteredResults.playlists).map((playlist) => (
                    <PlaylistItem
                      key={playlist.id}
                      playlist={playlist}
                      showMenu={false}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Watch Party Rooms Section */}
            {filteredResults.watchPartyRooms.length > 0 && (
              <section>
                {activeTab === 'all' && (
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FiPlay />
                      {language.search.watchParties || 'Watch Parties'} ({filteredResults.watchPartyRooms.length})
                    </h2>
                    {searchResult?.watchPartyRooms.length && searchResult.watchPartyRooms.length > 6 && (
                      <button
                        onClick={() => setActiveTab('rooms')}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {language.common.viewAll || 'View all'}
                      </button>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(activeTab === 'all' ? filteredResults.watchPartyRooms.slice(0, 6) : filteredResults.watchPartyRooms).map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      onJoinRoom={handleJoinRoom}
                    />
                  ))}
                </div>
              </section>
            )}

          </div>
        ) : (
          // No Results
          <div className="text-center py-20">
            <FiSearch className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {language.search.noResultsFound || 'No results found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {language.search.tryAdjusting || 'Try adjusting your search terms or browse our content'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {language.search.browseContent || 'Browse Content'}
            </button>
          </div>
        )}
      </div>

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal
        isOpen={addToPlaylistModal.isOpen}
        onClose={() => setAddToPlaylistModal({ isOpen: false, podcastId: '' })}
        podcastId={addToPlaylistModal.podcastId}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal({ isOpen: false, targetId: '', type: ReportType.P })}
        targetId={reportModal.targetId}
        reportType={reportModal.type}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, link: '' })}
        podcastLink={shareModal.link}
      />

    </div>
  );
};

export default SearchResults;