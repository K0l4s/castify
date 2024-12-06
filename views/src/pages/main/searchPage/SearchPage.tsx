import SearchUserResult from "../../../components/main/search/SearchUserResult";
import SearchPodcastResult from "../../../components/main/search/SearchPodcastResult";

const SearchPage = () => {
    return (
        <>
            <h1 className="text-2xl font-bold dark:text-white text-black text-center">Search Results</h1>
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
