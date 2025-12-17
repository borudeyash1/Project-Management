import React from 'react';

const DashboardSkeleton: React.FC = () => {
    return (
        <div className="p-4 sm:p-6 space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-3">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-48"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
            </div>

            {/* Sartthi Suite Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-56 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                ))}
            </div>

            {/* Stats Row Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                ))}
            </div>

            {/* Main Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Col */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                </div>
                {/* Right Col */}
                <div className="space-y-6">
                    <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
