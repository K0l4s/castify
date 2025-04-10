import React, { useEffect, useState } from "react";
import CustomModal from "../../UI/custom/CustomModal";
import { RiAiGenerate, RiUploadCloudLine } from "react-icons/ri";
import { useToast } from "../../../context/ToastProvider";
import { createPodcast } from "../../../services/PodcastService";
import { validateFileType } from "../../../utils/FileValidation";
import CustomButton from "../../UI/custom/CustomButton";
import { usePodcastContext } from "../../../context/PodcastContext";
import PlaylistSection from "./PlaylistSelection";
import { captureFrameFromVideo } from "../../../utils/FileUtils";
import GenreSelection from "./GenreSelection";
import { getGenres } from "../../../services/GenreService";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { MdUpload } from "react-icons/md";
import { IoCloseOutline } from "react-icons/io5";

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

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoFilename, setVideoFilename] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const [playlists, setPlaylists] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [showGenreModal, setShowGenreModal] = useState(false);


  const toast = useToast();

  const { fetchPodcasts } = usePodcastContext();

  // Mock API response
  useEffect(() => {
    const mockPlaylists = [
      { _id: "1", name: "Playlist 1" },
      { _id: "2", name: "Playlist 2" },
      { _id: "3", name: "Playlist 3" },
      { _id: "4", name: "Playlist 4" },
      { _id: "5", name: "Playlist 5" },
    ];
    setPlaylists(mockPlaylists);
  }, []);

   // Fetch genres when the modal is opened
   useEffect(() => {
    if (isOpen) {
      getGenres()
        .then((data) => setGenres(data))
        .catch((error) => {
          console.error("Failed to fetch genres:", error);
          toast.error("Failed to fetch genres. Please try again.");
        });
    }
  }, [isOpen]);

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const validExtensions = [".mp4", ".avi", ".mkv"];

      if (!validateFileType(file, validExtensions)) {
        toast.error(
          "Invalid file type. Please select a .mp4, .avi, or .mkv file."
        );
        return;
      }

      const videoUrl = URL.createObjectURL(file);
      setVideoPreview(videoUrl);
      setVideoFile(file);
      setVideoFilename(file.name);
    }
  };

  const handleThumbnailChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const validExtensions = [".jpg", ".jpeg", ".png", ".webp"];

      if (!validateFileType(file, validExtensions)) {
        toast.error(
          "Invalid file type. Please select a .jpg, .jpeg, .png, or .webp file."
        );
        return;
      }

      const thumbnailUrl = URL.createObjectURL(file);
      setThumbnailPreview(thumbnailUrl);
      setThumbnailFile(file);
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
      setDescError(value.length === 0 ? "Content is required" : "");
    } else {
      setDescError("Description can not exceed 5000 characters");
    }
  };

  const handlePlaylistChange = (playlistId: string) => {
    setSelectedPlaylists((prevSelected) =>
      prevSelected.includes(playlistId)
        ? prevSelected.filter((id) => id !== playlistId)
        : [...prevSelected, playlistId]
    );
  };

  const handleUpload = async () => {
    if (!title || !desc || !videoFile) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (selectedGenres.length === 0) {
      toast.error("Please select at least one genre");
      return;
    }

    const loadingToastId = toast.loading("Uploading podcast, please wait...");
    onClose();

    try {
      const payload = {
        title,
        content: desc,
        video: videoFile,
        thumbnail: thumbnailFile || undefined,
        genreIds: selectedGenres,
      };
      await createPodcast(payload);
      toast.success("Podcast uploaded successfully!");
      fetchPodcasts();
      toast.closeLoadingToast(loadingToastId);
      clearData();
    } catch (error) {
      console.error("Failed to upload podcast:", error);
      toast.error("Failed to upload podcast. Please try again.");
      toast.closeLoadingToast(loadingToastId);
    }
  };

  const clearData = () => {
    setTitle("");
    setDesc("");
    setTitleError("");
    setDescError("");
    setVideoFile(null);
    setVideoPreview(null);
    setVideoFilename(null);
    setThumbnailPreview(null);
    setThumbnailFile(null);
    setSelectedPlaylists([]);
    setSelectedGenres([]);
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      animation="zoom"
      size="xl"
      title="Upload Video"
      closeOnOutsideClick={false}
      closeOnEsc={false}
    >
      <div className="grid md:grid-cols-3 gap-4 ">
        <div className="flex flex-col md:col-span-2 col-span-3">
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
            Content (required)
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

        <div className="flex flex-col md:col-span-1 col-span-3">
          {videoPreview && (
            <div className="mb-4">
              <video src={videoPreview} controls className="w-full rounded" />
            </div>
          )}
          {videoPreview && (
            <>
              <span className="text-gray-400">Filename</span>
              <span
                className="text-sm text-black dark:text-white whitespace-nowrap overflow-hidden"
                title={`${videoFilename}`}
              >
                {videoFilename}
              </span>
            </>
          )}
          <CustomButton
            icon={<RiUploadCloudLine size={24} />}
            text="Choose Video"
            variant="primary"
            onClick={() => document.getElementById("video-input")?.click()}
            className="mt-2 uppercase leading-normal font-medium"
          />
          <input
            id="video-input"
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="hidden"
          />
        </div>

        {/* Thumbnail */}
        <div className="col-span-2">
          <div className="flex flex-col md:w-1/2">
            <label className="my-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Thumbnail
            </label>
            <div className="flex gap-4">
              {!thumbnailPreview && (
                <CustomButton
                  className="text-sm dark:text-white border-2 w-full py-4  border-dashed rounded hover:bg-gray-300 hover:dark:bg-gray-600"
                  icon={
                    <RiUploadCloudLine size={24} className="inline-block" />
                  }
                  text="Add"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("thumbnail-input")?.click()
                  }
                />
              )}
              <CustomButton
                className="text-sm dark:text-white border-2 w-full py-4  border-dashed rounded hover:bg-gray-300 hover:dark:bg-gray-600"
                icon={<RiAiGenerate size={24} className="inline-block" />}
                text="Auto generate"
                variant="outline"
                onClick={() => {
                  if (!videoFile) {
                    toast.error("Please select a video");
                  } else {
                    captureFrameFromVideo(videoFile, (thumbnail, thumbnailFile) => {
                      setThumbnailPreview(thumbnail);
                      setThumbnailFile(thumbnailFile);
                    });
                  }
                }}
              />
              <input
                id="thumbnail-input"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
            </div>

            {thumbnailPreview && (
              <div className="mt-2 p-1 relative mb-4 group object-cover w-full border-2 border-dashed border-gray-400">
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
                <button
                  className="absolute top-0 right-0"
                  title="Remove"
                  onClick={() => { setThumbnailPreview(null); setThumbnailFile(null); } }
                >
                  <IoCloseOutline
                    size={32}
                    className="p-1 hover:bg-gray-800 rounded-full transition-colors"
                  />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Playlist Selection Modal*/}
        <PlaylistSection
          selectedPlaylists={selectedPlaylists}
          setShowPlaylistModal={setShowPlaylistModal}
          showPlaylistModal={showPlaylistModal}
          playlists={playlists}
          handlePlaylistChange={handlePlaylistChange}
        />

        {/* Genre Selection Modal */}
        <div className="col-span-2">
          <div className="flex flex-col w-1/2 md:w-full">
            <label className="my-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Genres
            </label>
            <CustomButton
              className="text-base dark:text-white border-2 w-full md:w-1/2 border-dashed rounded hover:bg-gray-300 hover:dark:bg-gray-600"
              text={
                selectedGenres.length > 0
                  ? `${selectedGenres.length} Genres Selected`
                  : "Select Genres"
              }
              icon={<BiSolidCategoryAlt size={24} />}
              variant="outline"
              onClick={() => setShowGenreModal(true)}
            />
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedGenres.map((genreId) => {
                const genre = genres.find((g) => g.id === genreId);
                return (
                  <span
                    key={genreId}
                    className="px-4 py-2 bg-blue-600 text-white rounded-full"
                  >
                    {genre?.name}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-span-3 flex justify-end">
          <CustomButton
            icon={<MdUpload size={18}/>}
            onClick={handleUpload}
            text="Upload"
            variant="primary"
            size="lg"
            className="uppercase text-sm leading-normal font-medium"
          />
        </div>
      </div>

      <GenreSelection
        isOpen={showGenreModal}
        onClose={() => setShowGenreModal(false)}
        genres={genres}
        selectedGenres={selectedGenres}
        setSelectedGenres={setSelectedGenres}
      />

    </CustomModal>
  );
};

export default PodcastUploadModal;
