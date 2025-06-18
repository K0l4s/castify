import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PlaylistModel } from '../../../models/PlaylistModel';
import PlaylistService from '../../../services/PlaylistService';
import { formatDateTime, formatLastUpdatedFromNow } from '../../../utils/DateUtils';
import { FiLoader } from 'react-icons/fi';
import { useToast } from '../../../context/ToastProvider';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import CustomButton from '../../../components/UI/custom/CustomButton';
import { FaPlay, FaRandom, FaGripLines, FaTrashAlt, FaEdit, FaArrowLeft } from 'react-icons/fa';
import { HiDotsVertical } from 'react-icons/hi';
import { formatTimeDuration } from '../../../components/UI/podcast/video';
import no_img_available from '../../../assets/images/no_img_available.jpg';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import Avatar from '../../../components/UI/user/Avatar';
import { useLanguage } from '../../../context/LanguageContext';
import ConfirmModal from '../../../components/modals/utils/ConfirmDelete';
import CustomModal from '../../../components/UI/custom/CustomModal';

const DetailPlaylistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<PlaylistModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reordering, setReordering] = useState<boolean>(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    publish: false,
  });
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteItemModalOpen, setIsDeleteItemModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const navigate = useNavigate();
  const toast = useToast();
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const { language } = useLanguage();

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  const isOwnPlaylist = isAuthenticated && playlist?.owner && currentUser && 
                       playlist.owner.id === currentUser.id;

  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await PlaylistService.getPlaylistById(id, isAuthenticated);
        setPlaylist(data);
        
        // Initialize edit form
        setEditForm({
          name: data.name,
          description: data.description || "",
          publish: data.publish || false,
        });
      } catch (error) {
        console.error("Error fetching playlist:", error);
        setError("Failed to load playlist");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [id, isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenuId && menuRefs.current[activeMenuId] && 
          !menuRefs.current[activeMenuId]?.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };

    if (activeMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenuId]);

  const handlePlayAll = () => {
    if (!playlist || !playlist.items || playlist.items.length === 0) {
      toast.warning("This playlist has no items to play");
      return;
    }
    
    // Navigate to the first podcast with playlist ID parameter
    navigate(`/watch?pid=${playlist.items[0].podcastId}&playlist=${playlist.id}`);
  };

  const handleShuffle = () => {
    if (!playlist || !playlist.items || playlist.items.length === 0) {
      toast.warning("This playlist has no items to shuffle");
      return;
    }
    
    if (!isOwnPlaylist) {
      toast.warning("You can only shuffle your own playlists");
      return;
    }
    
    // Create a copy of items and shuffle them
    const items = [...playlist.items];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    
    // Extract podcast IDs in the new shuffled order
    const podcastIds = items.map(item => item.podcastId);

    setPlaylist({
      ...playlist,
      items
    });
    
    // Update the playlist order
    handleReorderItems(podcastIds);
  };

  const handleEditPlaylist = () => {
    setIsEditModalOpen(true);
  };

  const handleDeletePlaylist = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDeletePlaylist = async () => {
    if (!id) return;
    
    try {
      await PlaylistService.deletePlaylist(id);
      toast.success("Playlist deleted successfully");
      navigate("/playlist");
    } catch (error) {
      console.error("Failed to delete playlist:", error);
      toast.error("Failed to delete playlist");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveChanges = async () => {
    if (!id) return;
    
    try {
      const updatedPlaylist = await PlaylistService.updatePlaylist(
        id,
        editForm.name,
        editForm.description,
        editForm.publish
      );
      
      setPlaylist(updatedPlaylist);
      setIsEditModalOpen(false);
      toast.success("Playlist updated successfully");
    } catch (error) {
      console.error("Failed to update playlist:", error);
      toast.error("Failed to update playlist");
    }
  };

  const toggleMenu = (podcastId: string) => {
    if (!isAuthenticated) {
      toast.warning("Please login to access additional options");
      return;
    }
    setActiveMenuId(activeMenuId === podcastId ? null : podcastId);
  };

  // const handleSavePodcast = async (podcastId: string) => {
  //   toast.info(`Save feature is coming soon ${podcastId}`);
  //   setActiveMenuId(null);
  // };

  const handleRemoveItem = (podcastId: string) => {
    setItemToDelete(podcastId);
    setIsDeleteItemModalOpen(true);
  };

  const confirmRemoveItem = async () => {
    if (!id || !itemToDelete || !playlist) return;
    
    try {
      await PlaylistService.removePodcastToPlaylist(id, itemToDelete);
      
      // Update the local state
      const updatedItems = playlist.items.filter(item => item.podcastId !== itemToDelete);
      
      setPlaylist({
        ...playlist,
        items: updatedItems,
        totalItems: updatedItems.length,
      });
      
      toast.success("Item removed from playlist");
    } catch (error) {
      console.error("Failed to remove item from playlist:", error);
      toast.error("Failed to remove item from playlist");
    } finally {
      setIsDeleteItemModalOpen(false);
      setItemToDelete(null);
      setActiveMenuId(null);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!isOwnPlaylist) {
      toast.warning("You can only reorder your own playlists");
      return;
    }
    
    const { destination, source } = result;
    
    // Return if dropped outside the list or at the same position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    if (!playlist) return;
    
    // Reorder the items locally
    const items = Array.from(playlist.items);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);
    
    // Update the local state
    setPlaylist({
      ...playlist,
      items
    });
    
    // Extract podcast IDs in the new order
    const podcastIds = items.map(item => item.podcastId);
    
    // Save the new order to the server
    handleReorderItems(podcastIds);
  };

  const handleReorderItems = async (podcastIds: string[]) => {
    if (!id) return;
    
    try {
      setReordering(true);
      await PlaylistService.reorderPlaylistItems(id, podcastIds);
      toast.success('Playlist order updated');
    } catch (error) {
      console.error('Failed to update playlist order:', error);
      toast.error('Failed to update playlist order');
      
      // Refresh the playlist data on error
      try {
        const refreshedPlaylist = await PlaylistService.getPlaylistById(id, isAuthenticated);
        setPlaylist(refreshedPlaylist);
      } catch (refreshError) {
        console.error('Failed to refresh playlist data:', refreshError);
      }
    } finally {
      setReordering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <FiLoader size={48} className="text-blue-500 animate-spin"/>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg">
          {error || "Failed to load playlist"}
        </div>
        <CustomButton
          text="Go Back"
          icon={<FaArrowLeft />}
          variant="primary"
          onClick={() => navigate("/playlist")}
          className="mt-4"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white">Playlist Details</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side - Playlist Info */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="relative aspect-[16/9] mb-4 rounded-lg overflow-hidden shadow-md">
              <img
                src={playlist.thumbnail || no_img_available}
                alt={playlist.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <CustomButton
                  text={language.playlist.playAll}
                  icon={<FaPlay className="mr-2" />}
                  variant="primary"
                  size="lg"
                  onClick={handlePlayAll}
                  className="px-6 py-3"
                />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-black dark:text-white mb-2">{playlist.name}</h2>
            
            <div className="flex items-center mb-4">
              <Avatar
                width="w-10"
                height="h-10"
                avatarUrl={playlist.owner.avatarUrl}
                usedFrame={playlist.owner.usedFrame}
                alt="Owner avatar"
              />
              <span className="ml-2 text-md font-semibold text-gray-700 dark:text-gray-300">
                {playlist.owner.lastName} {playlist.owner.middleName} {playlist.owner.firstName}
              </span>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">{playlist.description || "No description"}</p>
            
            <div className="space-y-2 text-md text-gray-600 dark:text-gray-300">
              <p>{language.playlist.visibility}: {playlist.publish ? `${language.playlist.public}` : `${language.playlist.private}`}</p>
              <p>Videos: {playlist.totalItems}</p>
              {playlist.hiddenCount > 0 && (
                <p>{language.playlist.hiddenItem}: {playlist.hiddenCount}</p>
              )}
              <p>{language.playlist.lastUpdated}: {formatLastUpdatedFromNow(playlist.lastUpdated)}</p>
              <p>{language.playlist.createdAt}: {formatDateTime(playlist.createdAt)}</p>
            </div>
            
            <div className="flex flex-col space-y-3 mt-6">
              <CustomButton
                text={language.playlist.playAll}
                icon={<FaPlay />}
                variant="primary"
                onClick={handlePlayAll}
                className="w-full"
              />
              
              <CustomButton
                text={language.playlist.shuffle}
                icon={<FaRandom />}
                variant="secondary"
                onClick={handleShuffle}
                className="w-full"
                disabled={!isOwnPlaylist}
              />
              
              {isOwnPlaylist && (
                <>
                  <CustomButton
                    text={language.playlist.editPlaylist}
                    icon={<FaEdit />}
                    variant="outline"
                    onClick={handleEditPlaylist}
                    className="w-full"
                  />
                  
                  <CustomButton
                    text={language.playlist.deletePlaylist}
                    icon={<FaTrashAlt />}
                    variant="danger"
                    onClick={handleDeletePlaylist}
                    className="w-full"
                  />
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Side - Playlist Items */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                {playlist.hiddenCount > 0 
                  ? `${playlist.totalItems} videos (${playlist.hiddenCount} ${language.playlist.hidden})`
                  : `${playlist.totalItems} items`
                }
              </h3>
              
              {reordering && (
                <span className="text-sm text-blue-500 animate-pulse">Saving changes...</span>
              )}
            </div>
            
            {playlist.items.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <p>This playlist has no items yet.</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="playlist-items" isDropDisabled={!isOwnPlaylist}>
                  {(provided: DroppableProvided) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto"
                    >
                      {playlist.items.map((item, index) => (
                        <Draggable 
                          key={item.podcastId} 
                          draggableId={item.podcastId} 
                          index={index}
                          isDragDisabled={!isOwnPlaylist}
                        >
                          {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                                snapshot.isDragging ? 'opacity-70 shadow-lg bg-gray-100 dark:bg-gray-700' : ''
                              } relative`}
                            >
                              {/* Drag Handle - Only show if user owns playlist */}
                              {isOwnPlaylist && (
                                <div className="flex items-center mr-2">
                                  <div 
                                    {...provided.dragHandleProps}
                                    className="px-2 py-1 cursor-grab active:cursor-grabbing"
                                  >
                                    <FaGripLines className="text-gray-400" />
                                  </div>
                                </div>
                              )}

                              <div className="w-8 text-gray-500 dark:text-gray-400 flex items-center justify-center mr-3">
                                <span>{index + 1}</span>
                              </div>
                              
                              <div 
                                className="flex-1 flex items-start cursor-pointer"
                                onClick={() => navigate(`/watch?pid=${item.podcastId}&playlist=${playlist.id}`)}
                              >
                                <div className="relative w-32 md:w-40 h-20 md:h-24 mr-4">
                                  <img
                                    src={item.thumbnail || "https://via.placeholder.com/160x90"}
                                    alt="Video thumbnail"
                                    className="w-full h-full object-cover rounded-md aspect-[16/9]"
                                  />
                                  {item.duration && (
                                    <span className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                                      {formatTimeDuration(item.duration)}
                                    </span>
                                  )}
                                  
                                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center transition-all opacity-0 hover:opacity-100">
                                    <FaPlay className="text-white text-xl" />
                                  </div>
                                </div>
                                
                                <div className="flex-1 overflow-hidden">
                                  <p className="text-base font-medium line-clamp-2 text-black dark:text-white mb-1">
                                    {item.title}
                                  </p>
                                  <p className="text-sm line-clamp-1 text-gray-600 dark:text-gray-400">
                                    {item.owner || "Unknown"}
                                  </p>
                                  <p className="text-xs line-clamp-1 text-gray-500 dark:text-gray-500 mt-1">
                                    {item.description || "No description"}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Only show menu button for authenticated users */}
                              {isAuthenticated && (
                                <div className="relative flex items-start ml-2">
                                  <button
                                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                                    onClick={() => toggleMenu(item.podcastId)}
                                  >
                                    <HiDotsVertical size={18} className="text-gray-600 dark:text-gray-400" />
                                  </button>
                                  
                                  {/* Menu Options */}
                                  {activeMenuId === item.podcastId && (
                                    <div 
                                      ref={(el) => (menuRefs.current[item.podcastId] = el)}
                                      className="absolute right-8 top-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
                                    >
                                      <ul className="py-1">
                                        {/* <li 
                                          className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center text-gray-700 dark:text-gray-300 transition ease-in-out duration-200"
                                          onClick={() => handleSavePodcast(item.podcastId)}
                                        >
                                          <FaBookmark className="mr-2" />
                                          Save podcast
                                        </li> */}
                                        
                                        {/* Only show remove option if user owns the playlist */}
                                        {isOwnPlaylist && (
                                          <li 
                                            className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center text-red-500 transition ease-in-out duration-200"
                                            onClick={() => handleRemoveItem(item.podcastId)}
                                          >
                                            <FaTrashAlt className="mr-2" />
                                            Remove from playlist
                                          </li>
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>
      </div>
      
      {/* Edit Playlist Modal */}
      <CustomModal
        title={language.playlist.editPlaylist}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        size="md"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {language.playlist.name}
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
              {language.playlist.description}
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
              {language.playlist.visibility}
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
                <span className="text-sm text-gray-700 dark:text-gray-300">{language.playlist.public}</span>
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
                <span className="text-sm text-gray-700 dark:text-gray-300">{language.playlist.private}</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <CustomButton
              text={language.global.cancel}
              variant="ghost"
              onClick={() => setIsEditModalOpen(false)}
            />
            <CustomButton
              text={language.global.saveChanges}
              variant="primary"
              onClick={handleSaveChanges}
            />
          </div>
        </div>
      </CustomModal>
      
      {/* Confirm Delete Playlist Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title={language.global.deleteTitle}
        onConfirm={confirmDeletePlaylist}
        onClose={() => setIsDeleteModalOpen(false)}
      />
      
      {/* Confirm Remove Item Modal */}
      <ConfirmModal
        isOpen={isDeleteItemModalOpen}
        title={language.global.deleteTitle}
        onConfirm={confirmRemoveItem}
        onClose={() => setIsDeleteItemModalOpen(false)}
      />
    </div>
  );
};

export default DetailPlaylistPage;