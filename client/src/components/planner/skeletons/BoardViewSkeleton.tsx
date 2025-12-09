import React from 'react';

const BoardViewSkeleton: React.FC = () => {
    return (
        <div className="h-full overflow-x-auto p-6">
            <div className="flex gap-4 h-full min-w-max">
                {/* Render 4 column skeletons */}
                {[1, 2, 3, 4].map((col) => (
                    <div
                        key={col}
                        className="flex-shrink-0 w-80 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 animate-pulse"
                    >
                        {/* Column Header Skeleton */}
                        <div className="p-4 border-b border-gray-300 dark:border-gray-600">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                                    <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded" />
                                    <div className="h-4 w-6 bg-gray-300 dark:bg-gray-600 rounded" />
                                </div>
                            </div>
                        </div>

                        {/* Task Card Skeletons */}
                        <div className="p-3 space-y-3">
                            {[1, 2, 3].map((task) => (
                                <div
                                    key={task}
                                    className="bg-white dark:bg-gray-800 rounded-lg border-l-4 border-gray-300 dark:border-gray-600 p-3"
                                >
                                    <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
                                    <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                                    <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-full bg-gray-300 dark:bg-gray-600" />
                                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BoardViewSkeleton;
