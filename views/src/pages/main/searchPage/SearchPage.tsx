import SearchUserResult from "../../../components/main/search/SearchUserResult";
import SearchPodcastResult from "../../../components/main/search/SearchPodcastResult";
import { useState } from "react";

export enum searchType {
    PODCAST = "PODCAST",
    USER = "USER"
}

type SearchPageProps = searchType;
const SearchPage = () => {
    const [type, setType] = useState<SearchPageProps>(searchType.PODCAST);
    return (
        <>
            {/* <h1 className="text-2xl font-bold dark:text-white text-black text-center">Search Results</h1> */}
            <div className="flex justify-center items-center mt-5 mb-5">
                <button className={`text-black dark:text-white  px-4 py-2 mr-2 
                duration-300 ease-in-out
                ${type == searchType.PODCAST?'border-b-4 border-blue-500 dark:border-blue-400':'border-b-4 border-transparent'}`}
                    onClick={() => {
                        setType(searchType.PODCAST);
                    }
                    }
                >
                    Podcast
                </button>
                <button className={`text-black dark:text-white  px-4 py-2 duration-300 ease-in-out
                ${type == searchType.USER?'border-b-4 border-blue-500 dark:border-blue-400':'border-b-4 border-transparent'}`}

                    onClick={() => {
                        setType(searchType.USER);
                    }
                    }
                >
                    User
                </button>
            </div>
            <div className="">
                {type === searchType.PODCAST ?
                    <SearchPodcastResult />
                    :
                    type === searchType.USER ?
                        <SearchUserResult />
                        :
                        <div className="text-center text-2xl font-bold dark:text-white text-black">
                            Please select a search type
                        </div>
                }
            </div>
        </>
    );
};

export default SearchPage;
