import { useState } from "react";

const MainSearchBar = () => {

    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);


    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setShowSearchResults(e.target.value.length > 0);
    }

    const handleSearchFocus = () => {
        if (searchQuery) {
            setShowSearchResults(true);
        }
    }

    const handleSearchBlur = () => {
        // Small delay to allow clicking search results
        setTimeout(() => {
            setShowSearchResults(false);
        }, 200);
    }
    return (
        <div className="relative flex-1 max-w-xl mx-4">
            <div className="flex items-center px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-800 transition-all duration-200 bg-white/5 backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192.904 192.904" width="18" className="flex-shrink-0 fill-gray-600 dark:fill-gray-400 mr-3 transition-colors duration-200">
                    <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"></path>
                </svg>
                <input
                    type="search"
                    value={searchQuery}
                    onChange={handleSearch}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    placeholder="Search podcasts, episodes, creators..."
                    className="w-full bg-transparent text-black dark:text-white outline-none text-sm placeholder-gray-500 focus:placeholder-gray-400 transition-colors duration-200"
                    aria-label="Search"
                    data-testid="search-input"
                />
                <kbd className="hidden sm:inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 transition-colors duration-200">
                    ⌘K
                </kbd>
            </div>
            {showSearchResults && (
                <div className="absolute inset-x-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 backdrop-blur-lg backdrop-filter transform transition-all duration-200 ease-out" data-testid="search-results">
                    <div className="p-4">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Recent searches</div>
                        <div className="space-y-2">
                            <div className="flex items-center p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors duration-200" data-testid="search-result-item">
                                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-3 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Tech Talks Daily</span>
                            </div>
                            <div className="flex items-center p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors duration-200" data-testid="search-result-item">
                                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-3 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">The AI Revolution</span>
                            </div>
                            <div className="flex items-center p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors duration-200" data-testid="search-result-item">
                                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-3 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Startup Stories</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainSearchBar;
