import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { usePodcastContext } from "../../../context/PodcastContext";

const MyPodcastPage: React.FC = () => {
  const { podcasts, currentPage, totalPages, fetchPodcasts } = usePodcastContext();
  const location = useLocation();
  const navigate = useNavigate();
  const defaultThumbnail = "/TEST.png";

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
  }, [location.search, navigate]);

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
    navigate({ search: searchParams.toString() }, { replace: true });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">
        My Podcast Content
      </h1>
      <div className="flex flex-col gap-6 bg-gray-200 dark:bg-gray-800 rounded min-h-[73vh]">
        {/* Header Row */}
        <div className="grid grid-cols-7 border-b border-gray-400 dark:border-gray-600 overflow-hidden p-4 font-semibold text-slate-900 dark:text-white">
          <div className="col-span-2 text-center">Video</div>
          <div className="col-span-1 text-center">Display mode</div>
          <div className="col-span-1 text-center">Created Day</div>
          <div className="col-span-1 text-center">Views</div>
          <div className="col-span-1 text-center">Likes</div>
          <div className="col-span-1 text-center">Comments</div>
        </div>
        {podcasts.map((podcast) => (
          <div
            key={podcast.id}
            className="grid grid-cols-7 border-b border-gray-400 dark:border-gray-600 overflow-hidden p-4"
          >
            {/* Thumbnail, Title, Content */}
            <div className="flex gap-4 col-span-2">
              <img
                src={podcast.thumbnailUrl || defaultThumbnail}
                alt={podcast.title}
                className="w-20 h-16 object-cover rounded-md mb-2"
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
            <div className="flex items-center justify-center col-span-1 text-slate-800 dark:text-white">
              <p>{podcast.active ? "Public" : "Private"}</p>
            </div>
            {/* Created Day */}
            <div className="flex items-center justify-center col-span-1">
              <p className="text-sm text-slate-800 dark:text-white">
                {new Date(podcast.createdDay).toLocaleDateString()}
              </p>
            </div>
            {/* Views */}
            <div className="flex items-center justify-center col-span-1">
              <p className="text-slate-800 dark:text-white">{podcast.views}</p>
            </div>
            {/* Likes */}
            <div className="flex items-center justify-center col-span-1">
              <p className="text-slate-800 dark:text-white">{podcast.totalLikes}</p>
            </div>
            {/* Comments */}
            <div className="flex items-center justify-center col-span-1">
              <p className="text-slate-800 dark:text-white">{podcast.totalComments}</p>
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
