import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Podcast } from "../../../models/PodcastModel";
import PodcastCard from "../../UI/podcast/PodcastCard";
import { userService } from "../../../services/UserService";

const SearchPodcastResult = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search).get('keyword');
  const [podcasts, setPodcasts] = useState<Podcast[]>([]); // Ensure it's an empty array by default
  const [pageSize] = useState<number>(10); // Set pageSize small for easy testing
  const [pageNumber, setPageNumber] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  useEffect(() => {
    userService.searchPodcast(pageNumber, pageSize, queryParams?.toString() || '').then(res => {
      // Check if data is an array and not empty
      console.log(res)
      if (pageNumber === 0) {
        setPodcasts(res.data.content); // If it's the first time loading data, reset the list
      } else {
        setPodcasts(prevPodcasts => [...(prevPodcasts || []), ...res.data.content]); // Ensure prevPodcasts is always an array
      }
      setTotalPages(res.data.totalPages);
    }).catch(err => {
      console.error("Error fetching podcasts:", err);
      setPodcasts([]); // Handle error and ensure podcasts is always an array
    });
  }, [pageNumber, pageSize, queryParams]); // Add dependencies to track changes

  const handleLoadMore = () => {
    setPageNumber(prevPage => prevPage + 1); // Increase the page number to load more data
  };

  return (
    <div className="flex flex-col bg-white dark:bg-gray-700 p-4 rounded-xl min-h-screen">
      <h1 className="text-2xl font-bold dark:text-white text-black mb-5 text-center">Podcast</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
        {podcasts?.map((podcast) => (
          <PodcastCard
            key={podcast.id}
            id={podcast.id}
            title={podcast.title}
            user={{
              avatarUrl: podcast.user.avatarUrl,
              username: podcast.user.username,
              usedFrame: podcast.user.usedFrame,
            }}
            thumbnailUrl={podcast.thumbnailUrl || "/TEST.png"}
            views={podcast.views}
            duration={podcast.duration}
          />))}

      </div>
      {podcasts?.length === 0 ? (
        <div className="text-center">No podcast found</div>
      ) : null}

      {pageNumber < totalPages && ( // Display Load More button if there are more pages
        <p
          onClick={handleLoadMore}
          className="mt-4 px-4 py-2 text-blue-500 text-center cursor-pointer rounded hover:text-blue-600"
        >
          Load More
        </p>
      )}
    </div>
  );
};

export default SearchPodcastResult;
