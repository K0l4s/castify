import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { SearchService, SearchKeyword } from "../../services/SearchService";
import { FiClock, FiTrendingUp, FiX, FiTrash2 } from "react-icons/fi";
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";

const MainSearchBar = () => {
    const { language } = useLanguage();
    const navigate = useNavigate();
    
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [recentHistory, setRecentHistory] = useState<SearchKeyword[]>([]);
    const [trendingKeywords, setTrendingKeywords] = useState<SearchKeyword[]>([]);
    const [suggestions, setSuggestions] = useState<SearchKeyword[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounce function
    const debounce = useCallback((func: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    }, []);

    // Debounced search suggestions
    const debouncedGetSuggestions = useCallback(
        debounce(async (query: string) => {
            if (query.trim().length >= 2) {
                setIsLoading(true);
                try {
                    const results = await SearchService.getSearchSuggestions(query);
                    setSuggestions(results);
                } catch (error) {
                    console.error('Error getting suggestions:', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSuggestions([]);
            }
        }, 300),
        []
    );

    // Load search data separately
    const loadSearchData = async () => {
        try {
            const trending = await SearchService.getTrendingKeywords();
            setTrendingKeywords(trending);

            // Only load history if user is authenticated
            if (isAuthenticated) {
                const history = await SearchService.getSearchHistory();
                setRecentHistory(history);
            } else {
                setRecentHistory([]);
            }
        } catch (error) {
            console.error('Error loading search data:', error);
        }
    };

    // Handle input change
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        
        if (value.trim().length >= 2) {
            debouncedGetSuggestions(value);
        } else {
            setSuggestions([]);
        }
    };

    // Handle input focus
    const handleSearchFocus = async () => {
        setShowDropdown(true);
        if (searchQuery.trim().length < 2) {
            await loadSearchData();
        }
    };

    // Handle input blur
    const handleSearchBlur = () => {
        // Delay to allow clicking on dropdown items
        setTimeout(() => {
            setShowDropdown(false);
        }, 200);
    };

    // Handle Enter key
    const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            performSearch(searchQuery);
        }
    };

    // Perform search and navigate
    const performSearch = (keyword: string) => {
        if (keyword.trim()) {
            setShowDropdown(false);
            setSearchQuery(keyword);
            navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
        }
    };

    // Handle suggestion/history click
    const handleItemClick = (keyword: string) => {
        performSearch(keyword);
    };

    // Handle delete history item
    const handleDeleteHistoryItem = async (e: React.MouseEvent, keyword: string) => {
        e.stopPropagation(); // Prevent triggering search
        if (!isAuthenticated) return;
        try {
            await SearchService.deleteHistoryItem(keyword);
            // Remove item from local state
            setRecentHistory(prev => prev.filter(item => item.keyword !== keyword));
        } catch (error) {
            console.error('Error deleting history item:', error);
        }
    };

    // Handle clear all history
    const handleClearAllHistory = async () => {
        if (!isAuthenticated) return;
        try {
            await SearchService.clearAllHistory();
            setRecentHistory([]);
        } catch (error) {
            console.error('Error clearing all history:', error);
        }
    };

    // Clear search input
    const clearSearch = () => {
        setSearchQuery('');
        setSuggestions([]);
        inputRef.current?.focus();
    };

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative flex-1 max-w-xl mx-4" ref={dropdownRef}>
            <div className="flex items-center px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-800 transition-all duration-200 bg-white/5 backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192.904 192.904" width="18" className="flex-shrink-0 fill-gray-600 dark:fill-gray-400 mr-3 transition-colors duration-200">
                    <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"></path>
                </svg>
                <input
                    ref={inputRef}
                    type="search"
                    value={searchQuery}
                    onChange={handleSearch}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    onKeyDown={handleEnter}
                    placeholder={language.navbar.search}
                    className="w-full bg-transparent text-black dark:text-white outline-none text-sm placeholder-gray-500 focus:placeholder-gray-400 transition-colors duration-200 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
                    aria-label="Search"
                    data-testid="search-input"
                />
                
                {/* Clear button */}
                {searchQuery && (
                    <button
                        onClick={clearSearch}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                    >
                        <FiX size={16} className="text-gray-500 dark:text-gray-400" />
                    </button>
                )}
            </div>

            {/* Search Dropdown */}
            {showDropdown && (
                <div className="absolute inset-x-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 backdrop-blur-lg backdrop-filter transform transition-all duration-200 ease-out z-50 max-h-96 overflow-y-auto" data-testid="search-results">
                    
                    {/* Loading state */}
                    {isLoading && (
                        <div className="p-4 text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Loading suggestions...</div>
                        </div>
                    )}

                    {/* Suggestions (when typing) */}
                    {!isLoading && searchQuery.trim().length >= 2 && suggestions.length > 0 && (
                        <div className="p-4">
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                                <FiTrendingUp size={14} />
                                {language.searchbar.suggestions || "Suggestions"}
                            </div>
                            <div className="space-y-1">
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleItemClick(suggestion.keyword)}
                                        className="flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors duration-200"
                                        data-testid="search-suggestion-item"
                                    >
                                        <div className="flex items-center gap-3">
                                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {suggestion.keyword}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent searches + Trending (when not typing) */}
                    {!isLoading && searchQuery.trim().length < 2 && (
                        <div className="p-4">
                            {/* Recent searches section */}
                            {isAuthenticated && recentHistory.length > 0 && (
                                <div className="mb-6">
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FiClock size={14} />
                                            {language.searchbar.recentSearches || "Recent searches"}
                                        </div>
                                        {/* Clear all button */}
                                        <button
                                            onClick={handleClearAllHistory}
                                            className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                        >
                                            {language.searchbar.clearAll || "Clear all"}
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        {recentHistory.map((item, index) => (
                                            <div
                                                key={`recent-${index}`}
                                                className="flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg group transition-colors duration-200"
                                                data-testid="search-history-item"
                                            >
                                                <div 
                                                    className="flex items-center gap-3 flex-1 cursor-pointer"
                                                    onClick={() => handleItemClick(item.keyword)}
                                                >
                                                    <FiClock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {item.keyword}
                                                    </span>
                                                </div>
                                                {/* Delete button */}
                                                <button
                                                    onClick={(e) => handleDeleteHistoryItem(e, item.keyword)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-all duration-200"
                                                    title={language.searchbar.removeFromHistory || "Remove from History"}
                                                >
                                                    <FiTrash2 size={14} className="text-red-500 dark:text-red-400" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Trending keywords section */}
                            {trendingKeywords.length > 0 && (
                                <div>
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                                        <FiTrendingUp size={14} />
                                        {language.searchbar.trendingSearches || "Trending searches"}
                                    </div>
                                    <div className="space-y-1">
                                        {trendingKeywords.map((item, index) => (
                                            <div
                                                key={`trending-${index}`}
                                                onClick={() => handleItemClick(item.keyword)}
                                                className="flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors duration-200"
                                                data-testid="search-trending-item"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FiTrendingUp className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {item.keyword}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty state cho user mới */}
                            {(!isAuthenticated || recentHistory.length === 0) && trendingKeywords.length === 0 && (
                                <div className="text-center py-8">
                                    <FiTrendingUp size={32} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {language.searchbar.searchContentPlaceholder || "Start typing to search podcasts, users, and more..."}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* No results */}
                    {!isLoading && searchQuery.trim().length >= 2 && suggestions.length === 0 && (
                        <div className="p-4 text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{language.searchbar.noSuggestions || "No suggestions found"}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MainSearchBar;