import React, { useEffect, useRef, useState } from "react";
import { PlaylistModel } from "../../../models/PlaylistModel";
import PlaylistService from "../../../services/PlaylistService";
import PlaylistItem from "./PlaylistItem";
import { IoChevronDownSharp } from "react-icons/io5";
import { useClickOutside } from "../../../hooks/useClickOutside";
import CustomButton from "../../../components/UI/custom/CustomButton";
import CustomModal from "../../../components/UI/custom/CustomModal";
import ConfirmModal from "../../../components/modals/utils/ConfirmDelete";
import { FaPlus } from "react-icons/fa";
import CreatePlaylistModal from "./CreatePlaylistModal";
import { useToast } from "../../../context/ToastProvider";
import { useLanguage } from "../../../context/LanguageContext";

const PlaylistPage: React.FC = () => {
  const {language} = useLanguage();
  const [playlists, setPlaylists] = useState<PlaylistModel[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [sortBy, setSortBy] = useState<"updatedAt" | "createdAt">("updatedAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<PlaylistModel | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    publish: false,
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const toast = useToast();

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const data = await PlaylistService.getAuthUserPlaylist(sortBy, order);
      setPlaylists(data);
    } catch (error) {
      console.error("Failed to fetch playlists:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [sortBy, order]);

  const handleSortChange = (sortValue: "updatedAt" | "createdAt") => {
    setSortBy(sortValue);
    setOrder("desc"); // reset về desc khi đổi loại sort
    setDropdownOpen(false);
  };

  const handleEdit = (playlist: PlaylistModel) => {
    setEditingPlaylist(playlist);
    setEditForm({
      name: playlist.name,
      description: playlist.description || "",
      publish: playlist.publish || false,
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveChanges = async () => {
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
      } catch (error) {
        console.error("Failed to update playlist:", error);
      }
    }
  };

  const handleDelete = (playlistId: string) => {
    setPlaylistToDelete(playlistId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (playlistToDelete) {
      try {
        await PlaylistService.deletePlaylist(playlistToDelete);
        setPlaylists((prev) => prev.filter((playlist) => playlist.id !== playlistToDelete));
        setIsDeleteModalOpen(false);
        toast.success("Playlist deleted successfully");
      } catch (error) {
        console.error("Failed to delete playlist:", error);
      }
    }
  };

  useClickOutside(dropdownRef, () => setDropdownOpen(false));

  return (
    <div className="container mx-auto p-4 flex flex-col lg:flex-row rounded-lg">
      <div className="w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white">{language.playlist.title}</h1>

          <CustomButton
            text={language.playlist.create || "Create Playlist"}
            icon={<FaPlus />}
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
          />

          {/* Dropdown menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-black dark:text-white"
            >
              {sortBy === "updatedAt" ? language.playlist.lastUpdated || "Last updated" : language.playlist.createdAt || "Created day"}
              <IoChevronDownSharp />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border text-black dark:text-white rounded shadow-lg z-50">
                <button
                  onClick={() => handleSortChange("updatedAt")}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    sortBy === "updatedAt" ? "font-semibold" : ""
                  }`}
                >
                  {language.playlist.lastUpdated || "Last updated"}
                </button>
                <button
                  onClick={() => handleSortChange("createdAt")}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    sortBy === "createdAt" ? "font-semibold" : ""
                  }`}
                >
                  {language.playlist.createdAt || "Created day"}
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {playlists.map((playlist) => (
              <PlaylistItem key={playlist.id} playlist={playlist} onEdit={handleEdit} onDelete={handleDelete}/>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      {isDeleteModalOpen && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          title={language.playlist.deleteTitle || "Delete Playlist"}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
        />
      )}

      {isEditModalOpen && (
        <CustomModal
          title={ language.playlist.edit || "Edit Playlist"}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          size="md"
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {language.playlist.name || "Playlist Name"}
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
                {language.playlist.description || "Description"}
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
                text={language.common.cancel || "Cancel"}
                variant="ghost"
                onClick={() => setIsEditModalOpen(false)}
              />
              <CustomButton
                text={language.common.saveChanges || "Save Changes"}
                variant="primary"
                onClick={handleSaveChanges}
              />
            </div>
          </div>
        </CustomModal>
      )}

      {/* Create Playlist Modal */}
      <CreatePlaylistModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onPlaylistCreated={fetchPlaylists}
      />
    </div>
  );
};

export default PlaylistPage;
