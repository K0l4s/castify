import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPodcastById, updatePodcast } from "../../../services/PodcastService";
import { Podcast } from "../../../models/PodcastModel";

const EditPodcastPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [genreIds, setGenreIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        const data = await getPodcastById(id!);
        setPodcast(data);
        setTitle(data.title);
        setContent(data.content);
        setGenreIds(data.genres.map((genre) => genre.id));
      } catch (error) {
        console.error("Failed to fetch podcast", error);
      }
    };

    fetchPodcast();
  }, [id]);

  const handleUpdate = async () => {
    try {
      await updatePodcast(id!, title, content, thumbnail!, genreIds);
      navigate("/my-podcasts");
    } catch (error) {
      console.error("Failed to update podcast", error);
    }
  };

  if (!podcast) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">Edit Podcast</h1>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="p-2 border border-gray-300 rounded-lg"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          className="p-2 border border-gray-300 rounded-lg"
        />
        <input
          type="file"
          onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
          className="p-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Update Podcast
        </button>
      </div>
    </div>
  );
};

export default EditPodcastPage;