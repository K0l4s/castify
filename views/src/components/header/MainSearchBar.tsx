import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { SearchService, SearchKeyword } from "../../services/SearchService";
import { FiClock, FiTrendingUp, FiX } from "react-icons/fi";

const MainSearchBar = () => {
    const { language } = useLanguage();
    const navigate = useNavigate();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchHistory, setSearchHistory] = useState<SearchKeyword[]>([]);
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

    // Load search history when input is focused
    const loadSearchHistory = async () => {
        try {
            const history = await SearchService.getSearchHistory();
            setSearchHistory(history);
        } catch (error) {
            console.error('Error loading search history:', error);
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
            await loadSearchHistory();
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
                    className="w-full bg-transparent text-black dark:text-white outline-none text-sm placeholder-gray-500 focus:placeholder-gray-400 transition-colors duration-200"
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
                                Suggestions
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
                                        {suggestion.searchCount > 1 && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                                {suggestion.searchCount}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent searches (when not typing or no suggestions) */}
                    {!isLoading && searchQuery.trim().length < 2 && searchHistory.length > 0 && (
                        <div className="p-4">
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                                <FiClock size={14} />
                                Recent searches
                            </div>
                            <div className="space-y-1">
                                {searchHistory.map((item, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleItemClick(item.keyword)}
                                        className="flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors duration-200"
                                        data-testid="search-history-item"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FiClock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {item.keyword}
                                            </span>
                                        </div>
                                        {item.searchCount > 1 && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                                {item.searchCount}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No results */}
                    {!isLoading && searchQuery.trim().length >= 2 && suggestions.length === 0 && (
                        <div className="p-4 text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400">No suggestions found</div>
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && searchQuery.trim().length < 2 && searchHistory.length === 0 && (
                        <div className="p-4 text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Start typing to search...</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MainSearchBar;