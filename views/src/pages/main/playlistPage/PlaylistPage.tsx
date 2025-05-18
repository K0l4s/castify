import React, { useEffect, useState } from "react";
import { PlaylistModel } from "../../../models/PlaylistModel";
import PlaylistService from "../../../services/PlaylistService";
import PlaylistItem from "./PlaylistItem";

const PlaylistPage: React.FC = () => {
  const [playlists, setPlaylists] = useState<PlaylistModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const data = await PlaylistService.getAuthUserPlaylist();
        setPlaylists(data);
      } catch (error) {
        console.error("Failed to fetch playlists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  return (
    <div className="container mx-auto p-4 flex flex-col lg:flex-row rounded-lg">
      <div className="w-full">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-black dark:text-white">Playlist</h1>
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
