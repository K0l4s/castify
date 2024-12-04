import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { usePodcastContext } from "../../../context/PodcastContext";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { FiEdit } from "react-icons/fi";
import { formatDate } from "../../../utils/DateUtils";
import { MdLockPerson } from "react-icons/md";
import { FaGlobeAsia } from "react-icons/fa";
import { IoFilter } from "react-icons/io5";
import "./animation.css";
import CustomButton from "../../../components/UI/custom/CustomButton";
import { togglePodcasts } from "../../../services/PodcastService";

const MyPodcastPage: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const { podcasts, currentPage, totalPages, fetchPodcasts } = usePodcastContext();
  const location = useLocation();
  const navigate = useNavigate();
  const defaultThumbnail = "/TEST.png";

  const [selectedPodcasts, setSelectedPodcasts] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const defaultParams = {
    page: 0,
    size: 5,
    sortByCreatedDay: "desc",
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    let shouldNavigate = false;

    Object.keys(defaultParams).forEach((key) => {
      if (!searchParams.has(key)) {
        searchParams.set(
          key,
          defaultParams[key as keyof typeof defaultParams].toString()
        );
        shouldNavigate = true;
      }
    });

    if (shouldNavigate) {
      navigate({ search: searchParams.toString() }, { replace: true });
    } else {
      fetchPodcastsFromParams(searchParams);
    }
  }, [location.search, navigate, isAuthenticated]);

  const fetchPodcastsFromParams = async (searchParams: URLSearchParams) => {
    const page = Number(searchParams.get("page"));
    const size = Number(searchParams.get("size"));
    const sortByViews = searchParams.get("sortByViews") || "asc";
    const sortByComments = searchParams.get("sortByComments") || "asc";
    const sortByCreatedDay = searchParams.get("sortByCreatedDay") || "desc";

    fetchPodcasts(page, size, sortByViews, sortByComments, sortByCreatedDay);
  };

  const handlePageChange = (newPage: number) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("page", newPage.toString());
    setSelectedPodcasts([]);
    navigate({ search: searchParams.toString() }, { replace: true });
  };

  const handleEdit = (id: string) => {
    navigate(`/creator/edit-podcast/${id}`);
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedPodcasts((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((podcastId) => podcastId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSelectAllChange = () => {
    if (selectedPodcasts.length === podcasts.length) {
      setSelectedPodcasts([]);
    } else {
      setSelectedPodcasts(podcasts.map((podcast) => podcast.id));
    }
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(event.target.value);
    setFilterValue("");
  };

  const handleFilterValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(event.target.value);
  };

  const applyFilter = () => {
    console.log(`Applying filter: ${filter} with value: ${filterValue}`);
  };

  const cancelFilter = () => {
    setFilter("");
    setFilterValue("");
  };

  const handleDeleteSelected = () => {
    // Implement the logic to delete selected podcasts
    console.log("Deleting selected podcasts:", selectedPodcasts);
    setSelectedPodcasts([]);
  };

  const handleToggleDisplayMode = async () => {
    try {
      await togglePodcasts(selectedPodcasts);
      fetchPodcastsFromParams(new URLSearchParams(location.search));
      setSelectedPodcasts([]);
    } catch (error) {
      console.error("Failed to toggle display mode", error);
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
    setTimeout(() => {
      setSelectedPodcasts([]);
    }, 500); // Match the duration of the collapse transition
  };

  useEffect(() => {
    setIsExpanded(selectedPodcasts.length > 0);
  }, [selectedPodcasts]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">
        My Podcast Content
      </h1>
      <div className="flex flex-col gap-4 bg-gray-200 dark:bg-gray-800 rounded min-h-[73vh]">
        <div className={`expandable-row ${isExpanded ? 'expanded' : ''}`}>
          <div className="flex items-center justify-between px-4 py-2 bg-gray-700 dark:bg-gray-200">
            <span className="text-white dark:text-black border-r-2 border-gray-500 px-4">
              {selectedPodcasts.length} selected
            </span>
            <div className="flex items-center gap-2">
              <CustomButton
                text="Toggle display mode"
                variant="ghost"
                rounded="full"
                onClick={handleToggleDisplayMode}
                className="text-white dark:text-gray-900 hover:bg-gray-500 hover:dark:bg-gray-400"
              />
              <CustomButton
                text="Delete permanently"
                variant="ghost"
                rounded="full"
                onClick={handleDeleteSelected}
                className="text-white dark:text-gray-900 hover:bg-gray-500 hover:dark:bg-gray-400"
              />
              <button
                onClick={handleClose}
                className="text-white dark:text-black hover:bg-gray-500 rounded-full p-1 transition-colors"
              >
                <IoClose size={28} />
              </button>
            </div>
          </div>
        </div>
        {/* Filter Row */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-300 dark:bg-gray-700">
          <div className="flex items-center gap-4">
            <label htmlFor="filter" className="text-black dark:text-white">
              <IoFilter className="inline-block mb-1" />
            </label>
            <select
              id="filter"
              value={filter}
              onChange={handleFilterChange}
              className="p-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
            >
              <option value="">Select</option>
              <option value="title">Title</option>
              <option value="content">Content</option>
            </select>
            {filter && (
              <input
                type="text"
                value={filterValue}
                onChange={handleFilterValueChange}
                placeholder={`Enter ${filter}`}
                className="p-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
              />
            )}
          </div>
          {filter && (
            <div className="flex items-center gap-4">
              <button
                onClick={applyFilter}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Apply
              </button>
              <button
                onClick={cancelFilter}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        
        {/* Header Row */}
        <div className="text-sm grid grid-cols-12 border-b border-gray-400 dark:border-gray-600 overflow-hidden p-4 font-semibold text-slate-900 dark:text-white">
          <div className="col-span-1 text-center">
            <input
              type="checkbox"
              checked={selectedPodcasts.length === podcasts.length}
              onChange={handleSelectAllChange}
              className="w-5 h-5 cursor-pointer"
              title="Select all"
            />
          </div>
          <div className="col-span-5">Video</div>
          <div className="col-span-1 text-center">Display mode</div>
          <div className="col-span-1 text-center">Created Day</div>
          <div className="col-span-1 text-right">Views</div>
          <div className="col-span-1 text-right">Reactions</div>
          <div className="col-span-1 text-right">Comments</div>
          <div className="col-span-1 text-center">Edit</div>
        </div>
        {podcasts.map((podcast) => (
          <div
            key={podcast.id}
            className="grid grid-cols-12 border-b border-gray-400 dark:border-gray-600 overflow-hidden p-4"
          >
            {/* Checkbox */}
            <div className="flex items-center justify-center col-span-1">
              <input
                type="checkbox"
                checked={selectedPodcasts.includes(podcast.id)}
                onChange={() => handleCheckboxChange(podcast.id)}
                className="w-5 h-5 cursor-pointer"
              />
            </div>
            {/* Thumbnail, Title, Content */}
            <div className="flex gap-4 col-span-5">
              <img
                src={podcast.thumbnailUrl || defaultThumbnail}
                alt={podcast.title}
                className="w-28 h-16 object-cover rounded-md mb-2"
              />
              <div className="flex flex-col">
                <h2
                  className="text-base font-semibold line-clamp-1 text-black dark:text-white"
                  title={`${podcast.title}`}
                >
                  {podcast.title}
                </h2>
                <p className="text-sm line-clamp-2 text-slate-700 dark:text-gray-200">{podcast.content}</p>
              </div>
            </div>
            {/* Display mode */}
            <div className="flex items-center justify-center col-span-1 text-sm text-slate-800 dark:text-white">
              {podcast.active ? (
                <>
                  <FaGlobeAsia className="mb-1 mr-1"/>
                  Public
                </>
              ) : (
                <>
                  <MdLockPerson className="mb-1 mr-1" />
                  Private
                </>
              )}
            </div>
            {/* Created Day */}
            <div className="flex items-center justify-center col-span-1">
              <p className="text-sm text-slate-800 dark:text-white">
                {formatDate(podcast.createdDay)}
              </p>
            </div>
            {/* Views */}
            <div className="flex items-center justify-end col-span-1">
              <p className="text-slate-800 dark:text-white text-sm">{podcast.views}</p>
            </div>
            {/* Likes */}
            <div className="flex items-center justify-end col-span-1">
              <p className="text-slate-800 dark:text-white text-sm">{podcast.totalLikes}</p>
            </div>
            {/* Comments */}
            <div className="flex items-center justify-end col-span-1">
              <p className="text-slate-800 dark:text-white text-sm">{podcast.totalComments}</p>
            </div>
            {/* Actions */}
            <div className="flex items-center justify-center col-span-1">
              <button
                onClick={() => handleEdit(podcast.id)}
                className="text-blue-500 hover:text-blue-700"
              >
                <FiEdit size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end items-center mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="px-2 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
        >
          <IoIosArrowBack size={20} />
        </button>
        <span className="mx-2 text-black dark:text-white">
          {currentPage + 1} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage + 1 >= totalPages}
          className="px-2 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
        >
          <IoIosArrowForward size={20} />
        </button>
      </div>
    </div>
  );
};

export default MyPodcastPage;