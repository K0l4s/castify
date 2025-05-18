import React, { useRef, useState } from "react";
import { PlaylistModel } from "../../../models/PlaylistModel";
import { FaPlay } from "react-icons/fa";
import { IoEllipsisVerticalSharp } from "react-icons/io5";
import { useClickOutside } from "../../../hooks/useClickOutside";

interface PlaylistItemProps {
  playlist: PlaylistModel;
  onEdit?: (playlist: PlaylistModel) => void;
  onDelete?: (playlistId: string) => void;
}

const PlaylistItem: React.FC<PlaylistItemProps> = ({ playlist, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleEdit = () => {
    setMenuOpen(false);
    onEdit?.(playlist);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    onDelete?.(playlist.id);
  };

  useClickOutside(menuRef, () => setMenuOpen(false));

  return (
    <div className="relative group rounded-xl shadow-lg bg-white dark:bg-gray-800 transition-transform hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative w-full h-64">
        {/* Overlay layers behind the image */}
        <div className="absolute -top-2 left-0 w-full h-full bg-black dark:bg-white opacity-20 rounded-md scale-[.98] z-0"></div>
        <div className="absolute -top-4 left-0 w-full h-full bg-black dark:bg-white opacity-20 rounded-md scale-[.96] z-0"></div>

        {/* Thumbnail image on top */}
        <img
          src={playlist.thumbnail || undefined}
          alt={playlist.name}
          className="w-full h-full object-cover rounded-xl relative z-10"
        />

        <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-sm px-2 py-1 rounded z-40">
          {playlist.totalItems} video
        </div>

        {/* Play All Button - on top of image */}
        <button
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity z-20"
        >
          <FaPlay className="mr-2 mb-1" />
          Play all
        </button>

        
      </div>

      {/* Playlist details */}
      <div className="flex justify-between">
        <div className="p-4">
          <h2 className="font-semibold text-lg text-black dark:text-white truncate">{playlist.name}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{playlist.description}</p>
          <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
            {playlist.publish ? "Public" : "Private"}
          </p>
          <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
            Last updated: {new Date(playlist.lastUpdated).toLocaleString()}
          </p>
        </div>
        <div className="p-2 z-30" ref={menuRef}>
          {/* Menu Button */}
          <button
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <IoEllipsisVerticalSharp className="w-5 h-5 text-black dark:text-white" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-900 border rounded shadow-lg z-40">
              <button
                onClick={handleEdit}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white"
              >
                Chỉnh sửa
              </button>
              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Xoá
              </button>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default PlaylistItem;
