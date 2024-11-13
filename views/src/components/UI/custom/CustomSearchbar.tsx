import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

interface CustomSearchbarProps {
    placeholder?: string;
    onSearch?: (searchTerm: string) => void;
    className?: string;
}

const CustomSearchbar: React.FC<CustomSearchbarProps> = ({
    placeholder = 'Search...',
    onSearch,
    className = ''
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(searchTerm);
        }
    };

    return (
        <form 
            onSubmit={handleSubmit}
            className={`relative flex items-center ${className}`}
        >
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring"
            />
            <button
                type="submit"
                className="absolute left-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
                <FaSearch className="w-4 h-4" />
            </button>
        </form>
    );
};

export default CustomSearchbar;
