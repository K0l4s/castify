import React from 'react';

interface CustomTableProps {
    headers: string[];
    children: React.ReactNode;
    className?: string;
}

const CustomTable: React.FC<CustomTableProps> = ({
    headers,
    children,
    className = ''
}) => {
    return (
        <div className={`w-full overflow-x-auto ${className}`}>
            <table className="min-w-full divide-y dark:divide-gray-700 divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y dark:divide-gray-700 divide-gray-200">
                    {children}
                </tbody>
            </table>
        </div>
    );
};

export default CustomTable;
