import React from 'react'

const Skeleton = () => {
    return (
        <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
            </div>
            <div>
                <div className="h-24 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
        </div>
    )
}

export default Skeleton