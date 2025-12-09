import React from 'react';

const MyWorkViewSkeleton: React.FC = () => {
    return (
        <div className="h-full p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Section Skeletons */}
                {['Today', 'This Week', 'Upcoming'].map((section, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
                        {/* Section Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-5 w-24 bg-gray-300 dark:bg-gray-600 rounded" />
                            <div className="h-5 w-8 bg-gray-300 dark:bg-gray-600 rounded-full" />
                        </div>

                        {/* Task Items */}
                        <div className="space-y-3">
                            {[1, 2, 3].map((task) => (
                                <div key={task} className="border-l-4 border-gray-300 dark:border-gray-600 pl-3">
                                    <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
                                    <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="h-5 w-5 rounded-full bg-gray-300 dark:bg-gray-600" />
                                        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
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

export default MyWorkViewSkeleton;
