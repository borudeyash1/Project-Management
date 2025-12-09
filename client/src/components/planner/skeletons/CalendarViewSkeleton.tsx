import React from 'react';

const CalendarViewSkeleton: React.FC = () => {
    return (
        <div className="h-full p-6 animate-pulse">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="h-6 w-40 bg-gray-300 dark:bg-gray-600 rounded" />
                <div className="flex gap-2">
                    <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded" />
                    <div className="h-8 w-20 bg-gray-300 dark:bg-gray-600 rounded" />
                    <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded" />
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                        <div key={idx} className="p-3 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                            <div className="h-4 w-8 bg-gray-300 dark:bg-gray-600 rounded mx-auto" />
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7">
                    {Array.from({ length: 35 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="min-h-[120px] p-2 border-r border-b border-gray-200 dark:border-gray-700 last:border-r-0"
                        >
                            <div className="h-4 w-6 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
                            <div className="space-y-1">
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CalendarViewSkeleton;
