import React from 'react';

const ListViewSkeleton: React.FC = () => {
    return (
        <div className="h-full p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {/* Header Skeleton */}
                <div className="grid grid-cols-6 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    {['Task', 'Status', 'Priority', 'Assignee', 'Due Date', 'Tags'].map((header, idx) => (
                        <div key={idx} className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                    ))}
                </div>

                {/* Row Skeletons */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                        <div key={row} className="grid grid-cols-6 gap-4 p-4 animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600" />
                                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                            </div>
                            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="flex gap-1">
                                <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                                <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ListViewSkeleton;
