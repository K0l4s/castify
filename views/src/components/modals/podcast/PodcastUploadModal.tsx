import React, { useEffect, useState } from "react";
import CustomModal from "../../UI/custom/CustomModal";
import { RiAiGenerate, RiUploadCloudLine } from "react-icons/ri";

interface PodcastUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PodcastUploadModal: React.FC<PodcastUploadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [titleError, setTitleError] = useState("");
  const [descError, setDescError] = useState("");

  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoFilename, setVideoFilename] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [playlists, setPlaylists] = useState<{ _id: number; name: string }[]>(
    []
  );
  const [selectedPlaylists, setSelectedPlaylists] = useState<number[]>([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  // Mock API response
  useEffect(() => {
    const mockPlaylists = [
      { _id: 1, name: "Playlist 1" },
      { _id: 2, name: "Playlist 2" },
      { _id: 3, name: "Playlist 3" },
      { _id: 4, name: "Playlist 4" },
      { _id: 5, name: "Playlist 5" },
    ];
    setPlaylists(mockPlaylists);
  }, []);

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      setVideoPreview(videoUrl);
      setVideoFilename(file.name);
    }
  };

  const handleThumbnailChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const thumbnailUrl = URL.createObjectURL(file);
      setThumbnailPreview(thumbnailUrl);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 100) {
      setTitle(value);
      setTitleError(value.length === 0 ? "Title is required" : "");
    } else {
      setTitleError("Title can not exceed 100 characters");
    }
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 5000) {
      setDesc(value);
      setDescError("");
    } else {
      setDescError("Description can not exceed 5000 characters");
    }
  };

  const handlePlaylistSelect = (playlistId: number) => {
    setSelectedPlaylists((prevSelected) =>
      prevSelected.includes(playlistId)
        ? prevSelected.filter((id) => id !== playlistId)
        : [...prevSelected, playlistId]
    );
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      animation="zoom"
      size="xl"
      title="Upload Video"
      closeOnOutsideClick={false}
    >
      <div className="grid md:grid-cols-3 gap-4">
        <div className="flex flex-col col-span-2">
          {/* Title */}
          <label
            className={`mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 ${
              titleError ? "text-red-600 dark:text-red-600" : ""
            }`}
          >
            Title (required)
          </label>
          <input
            type="text"
            placeholder="Write a catchy title for your video"
            value={title}
            onChange={handleTitleChange}
            className={`mb-1 w-full p-2 border border-gray-300 rounded bg-white dark:bg-gray-800 ${
              titleError ? "border-red-500" : ""
            }`}
          />
          <div className="flex justify-between">
            {titleError ? (
              <div className="text-sm text-red-500">{titleError}</div>
            ) : (
              <span></span>
            )}
            <div className="text-right text-xs text-gray-500 dark:text-gray-400">
              {title.length} / 100
            </div>
          </div>

          {/* Description */}
          <label
            className={`mt-4 mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 ${
              descError ? "text-red-600 dark:text-red-600" : ""
            }`}
          >
            Description
          </label>
          <textarea
            placeholder="Tell viewers about your video"
            value={desc}
            onChange={handleDescChange}
            className={`mb-1 w-full h-48 p-2 border border-gray-300 rounded resize-none bg-white dark:bg-gray-800 ${
              descError ? "border-red-500" : ""
            }`}
          />
          <div className="flex justify-between">
            {descError ? (
              <div className="text-sm text-red-500">{descError}</div>
            ) : (
              <span></span>
            )}
            <div className="text-right text-xs text-gray-500 dark:text-gray-400">
              {desc.length} / 5000
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          {videoPreview && (
            <div className="mb-4">
              <video src={videoPreview} controls className="w-full rounded" />
            </div>
          )}
          {videoPreview && (
            <>
              <span className="text-gray-400">Filename</span>
              <span className="text-sm text-black dark:text-white whitespace-nowrap overflow-hidden" title={`${videoFilename}`} >{videoFilename}</span>
            </>
          )}
          <label className="mt-4 w-full flex gap-2 items-center justify-center py-2 bg-white text-blue-500 rounded-lg shadow-lg 
            uppercase border border-blue cursor-pointer hover:bg-blue-500 hover:text-white transition-colors">
            <RiUploadCloudLine size={24} className="inline-block" />
            <span className="text-base font-medium leading-normal">Choose Video</span>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="hidden"
            />
          </label>
          
        </div>

        {/* Thumbnail */}
        <div className="col-span-2">
          <div className="flex flex-col md:w-2/3">
            <label className="my-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Thumbnail
            </label>
            <div className="flex gap-4">
              {!thumbnailPreview && (
                <label
                  className="text-center text-sm text-black dark:text-white border-2 w-full py-4
                  border-gray-400 border-dashed rounded cursor-pointer hover:bg-gray-300 hover:dark:bg-gray-600 transition-colors"
                >
                  <RiUploadCloudLine size={24} className="inline-block" /> Add
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </label>
              )}
                <label
                  className="text-center text-sm text-black dark:text-white border-2 w-full py-4
                  border-gray-400 border-dashed rounded cursor-pointer hover:bg-gray-300 hover:dark:bg-gray-600 transition-colors"
                >
                  <RiAiGenerate size={24} className="inline-block" /> Auto generate
                </label>
            </div>
            
            {thumbnailPreview && (
              <div className="mt-2 relative mb-4 group object-cover w-full">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail Preview"
                  className="w-full h-36 rounded"
                />
                <label
                  className="absolute inset-0 flex items-center justify-center bg-black 
                  bg-opacity-50 opacity-0 group-hover:opacity-100 cursor-pointer transition duration-300"
                >
                  <RiUploadCloudLine className="text-white" size={32} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Playlist */}
        <div className="col-span-2">
          <div className="flex flex-col w-1/2">
            <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Playlist
            </label>
            <button
              onClick={() => setShowPlaylistModal(true)}
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
            >
              {selectedPlaylists.length > 0
                ? `${selectedPlaylists.length} Playlists Selected`
                : "Select Playlists"}
            </button>
          </div>
        </div>

        <CustomModal
          isOpen={showPlaylistModal}
          onClose={() => setShowPlaylistModal(false)}
          animation="zoom"
          size="md"
          title="Select Playlists"
        >
          <div className="max-h-64 overflow-y-auto">
            {playlists.map((playlist) => (
              <div key={playlist._id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`playlist-${playlist._id}`}
                  checked={selectedPlaylists.includes(playlist._id)}
                  onChange={() => handlePlaylistSelect(playlist._id)}
                  className="mr-2"
                />
                <label
                  htmlFor={`playlist-${playlist._id}`}
                  className="cursor-pointer"
                >
                  {playlist.name}
                </label>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowPlaylistModal(false)}
            className="mt-4 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
          >
            Done
          </button>
        </CustomModal>
      </div>
    </CustomModal>
  );
};

export default PodcastUploadModal;
