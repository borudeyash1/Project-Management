import React from 'react';

const TimelineViewSkeleton: React.FC = () => {
    return (
        <div className="h-full flex bg-notion-canvas dark:bg-app-bg">
            {/* Sidebar Skeleton */}
            <div className="w-[280px] h-full bg-notion-sidebar dark:bg-sidebar-bg border-r border-notion-border dark:border-border-subtle animate-pulse">
                <div className="p-4 border-b border-notion-border dark:border-border-subtle">
                    <div className="h-5 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-3" />
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="p-3 space-y-2">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="bg-white dark:bg-gray-800 rounded-lg p-3 border-l-4 border-gray-300 dark:border-gray-600">
                            <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
                            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                            <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Timeline Grid Skeleton */}
            <div className="flex-1 overflow-auto">
                {/* Time Header */}
                <div className="sticky top-0 bg-notion-canvas dark:bg-app-bg border-b border-notion-border dark:border-border-subtle animate-pulse">
                    <div className="flex">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((hour) => (
                            <div key={hour} className="w-[120px] px-2 py-3 border-r border-notion-border dark:border-border-subtle">
                                <div className="h-3 w-12 bg-gray-300 dark:bg-gray-600 rounded" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resource Rows */}
                <div>
                    {[1, 2, 3].map((row) => (
                        <div key={row} className="relative border-b border-notion-border dark:border-border-subtle h-[60px] animate-pulse">
                            <div className="absolute left-0 top-0 bottom-0 w-40 bg-notion-sidebar dark:bg-sidebar-bg border-r border-notion-border dark:border-border-subtle px-3 py-2 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600" />
                                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TimelineViewSkeleton;
