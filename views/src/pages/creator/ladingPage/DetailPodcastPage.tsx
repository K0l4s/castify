import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { updatePodcast, togglePodcasts, deletePodcasts, getPodcastBySelf } from "../../../services/PodcastService";
import { getGenres } from "../../../services/GenreService";
import { Podcast } from "../../../models/PodcastModel";
import CustomButton from "../../../components/UI/custom/CustomButton";
import { RiUploadCloudLine } from "react-icons/ri";
import { FaGlobeAsia } from "react-icons/fa";
import { MdLockPerson } from "react-icons/md";
import { useToast } from "../../../context/ToastProvider";
import { validateFileType } from "../../../utils/FileValidation";
import GenreSelection from "../../../components/modals/podcast/GenreSelection";
import Loading from "../../../components/UI/custom/Loading";
import CommentSection from "../../../components/UI/podcast/CommentSection";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import NotAccessPage from "../../informationPage/NotAccessPage";
import ConfirmModal from "../../../components/modals/utils/ConfirmDelete";

const DetailPodcastPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [initialPodcast, setInitialPodcast] = useState<Podcast | null>(null);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [genreIds, setGenreIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);
  const [isGenreModalOpen, setIsGenreModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [titleError, setTitleError] = useState<string>("");
  const [contentError, setContentError] = useState<string>("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [accessError, setAccessError] = useState<string>("");

  const userRedux = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        const data = await getPodcastBySelf(id!);
        setPodcast(data);
        setInitialPodcast(data);
        setTitle(data.title);
        setContent(data.content);
        setGenreIds(data.genres!.map((genre) => genre.id));
        setIsActive(data.active);
        setThumbnailPreview(data.thumbnailUrl);
      } catch (error) {
        if (error instanceof Error) {
          if ((error as any).response?.data === "Error: Access denied") {
            setAccessError("Access denied");
          }
        }
        console.error("Failed to fetch podcast", error);
      }
    };

    const fetchGenres = async () => {
      try {
        const data = await getGenres();
        setGenres(data);
      } catch (error) {
        console.error("Failed to fetch genres", error);
      }
    };

    fetchPodcast();
    fetchGenres();
  }, [id]);

  if (accessError) {
    return <NotAccessPage />;
  }

  const handleUpdate = async () => {
    if (
      title === initialPodcast?.title &&
      content === initialPodcast?.content &&
      genreIds.sort().toString() === initialPodcast.genres!.map((genre) => genre.id).sort().toString() &&
      thumbnailPreview === initialPodcast.thumbnailUrl
    ) {
      toast.info("No changes to save.");
      return;
    }
    
    if (titleError || contentError) {
      toast.error("Please fix errors before saving.");
      return;
    }

    if (genreIds.length === 0) {
      toast.error("Please select at least one genre.");
      return;
    }

    setIsLoading(true);
    try {
      await updatePodcast(id!, title, content, thumbnail!, genreIds);
      const updatedPodcast = await getPodcastBySelf(id!);
      setPodcast(updatedPodcast);
      setInitialPodcast(updatedPodcast);
      setThumbnailPreview(updatedPodcast.thumbnailUrl);
      setThumbnail(null);
      toast.success("Podcast updated successfully!");
    } catch (error) {
      console.error("Failed to update podcast", error);
      toast.error("Failed to update podcast. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setThumbnail(file);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 100) {
      setTitle(value);
      setTitleError(value.length === 0 ? "Title is required" : "");
    } else {
      setTitleError("Title cannot exceed 100 characters");
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 5000) {
      setContent(value);
      setContentError(value.length === 0 ? "Please describe your content" : "");
    } else {
      setContentError("Content cannot exceed 5000 characters");
    }
  };

  const handleCancel = () => {
    if (initialPodcast) {
      setTitle(initialPodcast.title);
      setContent(initialPodcast.content);
      setGenreIds(initialPodcast.genres!.map((genre) => genre.id));
      setThumbnailPreview(initialPodcast.thumbnailUrl);
      setThumbnail(null);
      setTitleError("");
      setContentError("");
    }
  };

  const handleToggleDisplayMode = async (active: boolean) => {
    try {
      await togglePodcasts([id!]);
      setIsActive(active);
      toast.success(`Podcast is now ${active ? "public" : "private"}`);
    } catch (error) {
      console.error("Failed to toggle display mode", error);
      toast.error("Failed to toggle display mode. Please try again.");
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      await deletePodcasts([id!]);
      toast.success("Podcast deleted successfully!");
      setIsDeleteModalOpen(false);
      navigate("/creator/contents?page=0&size=5&sortByCreatedDay=desc");
    } catch (error) {
      console.error("Failed to delete podcast", error);
      toast.error("Failed to delete podcast. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="container mx-auto min-h-screen p-4">
      {isLoading && <Loading />}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Detail Podcast
          </h1>
          <CustomButton
              onClick={() => navigate(-1)}
              text="Back"
              variant="outline"
              rounded="full"
              className="uppercase text-sm leading-normal font-medium text-gray-500 dark:text-gray-900 hover:dark:text-white 
                bg-white hover:bg-gray-600 hover:dark:bg-gray-800 hover:text-white"
            />
        </div>
        <div className="flex gap-2">
          <div className="flex gap-4 items-center mr-12">
            <CustomButton
              onClick={() => navigate(`/watch?pid=${podcast?.id}`)}
              text="View on Blankcil"
              variant="outline"
              rounded="full"
              className="uppercase text-sm leading-normal font-medium text-white dark:text-white hover:dark:text-white 
                bg-blue-600 hover:bg-red-700 hover:dark:bg-blue-700 hover:text-white"
            />
            <CustomButton
              onClick={openDeleteModal}
              text="Delete permanently"
              variant="outline"
              rounded="full"
              className="uppercase text-sm leading-normal font-medium text-white dark:text-white hover:dark:text-white 
                bg-red-600 hover:bg-red-700 hover:dark:bg-red-700 hover:text-white"
            />
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title= "Are you sure to delete this content?"
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
              />
          </div>
          <div className="flex gap-2 items-center mr-12">
            <span className="font-medium text-black dark:text-white">Display mode</span>
            <CustomButton 
              text="Public"
              rounded="full"
              icon={<FaGlobeAsia className="inline-block mb-1" />}
              onClick={() => handleToggleDisplayMode(true)}
              className={`${
                isActive
                  ? "bg-blue-500 text-white"
                  : "bg-gray-800 dark:bg-gray-700 text-black dark:text-white"
              }`}
            />
            <CustomButton 
              text="Private"
              rounded="full"
              icon={<MdLockPerson className="inline-block mb-1" />}
              onClick={() => handleToggleDisplayMode(false)}
              className={`${
                !isActive
                  ? "bg-blue-500 text-white"
                  : "bg-gray-800 dark:bg-gray-700 text-black dark:text-white"
              }`}
            />
          </div>
          <CustomButton
            onClick={handleCancel}
            text="Cancel"
            variant="outline"
            rounded="full"
            className="uppercase text-sm leading-normal font-medium text-gray-500 dark:text-gray-900 hover:dark:text-white 
              bg-white hover:bg-gray-600 hover:dark:bg-gray-800 hover:text-white"
          />
          <CustomButton
            onClick={handleUpdate}
            text="Save Changes"
            variant="outline"
            rounded="full"
            className="uppercase text-sm leading-normal font-medium text-white dark:text-white hover:dark:text-white 
              bg-green-600 hover:bg-green-700 hover:dark:bg-green-700 hover:text-white"
          />
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="flex flex-col md:col-span-2 col-span-3">
          {/* Title */}
          <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Title (required)
          </label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className={`mb-2 w-full p-2 text-black dark:text-white border border-gray-300 rounded bg-white dark:bg-gray-800
              ${titleError ? "border-red-500" : ""}
            `}
          />
          <div className="flex justify-between mb-2">
            {titleError ? (
              <div className="text-sm text-red-500">{titleError}</div>
            ) : (
              <span></span>
            )}
            <div className="text-right text-xs text-gray-500 dark:text-gray-400">
              {title.length} / 100
            </div>
          </div>

          {/* Content */}
          <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Content (required)
          </label>
          <textarea
            value={content}
            onChange={handleContentChange}
            className={`mb-2 w-full h-48 p-2 text-black dark:text-white border border-gray-300 rounded resize-none bg-white dark:bg-gray-800
              ${contentError ? "border-red-500" : ""}`}
          />
          <div className="flex justify-between mb-2">
            {contentError ? (
              <div className="text-sm text-red-500">{contentError}</div>
            ) : (
              <span></span>
            )}
            <div className="text-right text-xs text-gray-500 dark:text-gray-400">
              {content?.length} / 5000
            </div>
          </div>
          
          {/* Genres */}
          <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Genres
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {genres
              .filter((genre) => genreIds.includes(genre.id))
              .map((genre) => (
                <span
                  key={genre.id}
                  className="px-4 py-2 rounded-full bg-blue-500 text-white"
                >
                  {genre.name}
                </span>
              ))}
            <CustomButton 
              text="Change Genres"
              rounded="full"
              variant="ghost"
              onClick={() => setIsGenreModalOpen(true)}
            />
          </div>
        </div>

        <div className="flex flex-col md:col-span-1 col-span-3">
          {/* Original Video */}
          {podcast && podcast.videoUrl && (
            <div className="mb-4">
              <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Original Video
              </label>
              <video src={podcast.videoUrl} controls className="w-full rounded" />
            </div>
          )}

          {/* Thumbnail */}
          <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Thumbnail
          </label>
          <div className="flex gap-4 mb-4">
            {!thumbnailPreview && (
              <CustomButton
                className="text-sm dark:text-white border-2 w-full py-4 border-dashed rounded 
                  hover:bg-gray-300 hover:dark:bg-gray-600"
                icon={<RiUploadCloudLine size={24} className="inline-block" />}
                text="Add"
                variant="outline"
                onClick={() => document.getElementById("thumbnail-input")?.click()}
              />
            )}
            <input
              id="thumbnail-input"
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
            />
          </div>
          {thumbnailPreview && (
            <div className="p-1 relative mb-4 group object-cover w-40 h-24 border-2 border-dashed border-gray-400">
              <img
                src={thumbnailPreview}
                alt="Thumbnail Preview"
                className="w-full h-full rounded"
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

      {/* Genre Selection Modal */}
      <GenreSelection
        isOpen={isGenreModalOpen}
        onClose={() => setIsGenreModalOpen(false)}
        genres={genres}
        selectedGenres={genreIds}
        setSelectedGenres={setGenreIds}
      />

      
      {/* Comment Section */}
      <h1 className="text-2xl font-semibold mt-4 text-black dark:text-white">Manage your podcast comments</h1>
      <div className="bg-gray-300 dark:bg-gray-800 px-4 py-1 rounded-lg mt-2">
        {podcast && (
          <CommentSection
            podcastId={podcast.id}
            totalComments={podcast.totalComments}
            currentUserId={userRedux?.id!}
          />
        )}
      </div>
    </div>
  );
};

export default DetailPodcastPage;