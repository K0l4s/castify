import SearchUserResult from "../../../components/main/search/SearchUserResult";
import SearchPodcastResult from "../../../components/main/search/SearchPodcastResult";

const SearchPage = () => {
    return (
        <>
            {/* <h1 className="text-2xl font-bold dark:text-white text-black text-center">Search Results</h1> */}
            <div className="flex justify-center items-center mt-5 mb-5">
                <button className="text-black dark:text-white  px-4 py-2 mr-2 
                border-b-4 border-blue-500 dark:border-blue-400">
                    Podcast
                </button>
                <button className="text-black dark:text-white  px-4 py-2">
                    User
                </button>
            </div>
            <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                <div className="col-span-1 md:col-span-1 lg:col-span-2 xl:col-span-3">
                    <SearchPodcastResult />
                </div>
                <div className="col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1">
                    <SearchUserResult />
                </div>
            </div>
        </>
    );
};

export default SearchPage;
