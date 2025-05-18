import React, { useEffect, useRef, useState } from "react";
import { PlaylistModel } from "../../../models/PlaylistModel";
import PlaylistService from "../../../services/PlaylistService";
import PlaylistItem from "./PlaylistItem";
import { IoChevronDownSharp } from "react-icons/io5";
import { useClickOutside } from "../../../hooks/useClickOutside";

const PlaylistPage: React.FC = () => {
  const [playlists, setPlaylists] = useState<PlaylistModel[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [sortBy, setSortBy] = useState<"updatedAt" | "createdAt">("updatedAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);

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

  useClickOutside(dropdownRef, () => setDropdownOpen(false));

  return (
    <div className="container mx-auto p-4 flex flex-col lg:flex-row rounded-lg">
      <div className="w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white">Playlist</h1>

          {/* Dropdown menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-black dark:text-white"
            >
              {sortBy === "updatedAt" ? "Last updated" : "Created day"}
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
                  Last updated
                </button>
                <button
                  onClick={() => handleSortChange("createdAt")}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    sortBy === "createdAt" ? "font-semibold" : ""
                  }`}
                >
                  Created day
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((playlist) => (
              <PlaylistItem key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistPage;
