import React from 'react';

interface ProjectPageSkeletonProps {
    type?: 'overview' | 'info' | 'team' | 'tasks' | 'timeline' | 'progress' | 'workload' | 'reports' | 'documents' | 'inbox';
}

const ProjectPageSkeleton: React.FC<ProjectPageSkeletonProps> = ({ type = 'overview' }) => {
    // Common skeleton elements
    const SkeletonCard = () => (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
        </div>
    );

    const SkeletonHeader = () => (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="flex gap-2">
                    <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        </div>
    );

    const SkeletonTable = () => (
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden animate-pulse">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
            {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            ))}
        </div>
    );

    const SkeletonStats = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
            ))}
        </div>
    );

    // Type-specific skeletons
    const renderSkeleton = () => {
        switch (type) {
            case 'overview':
                return (
                    <div className="p-6">
                        <SkeletonHeader />
                        <SkeletonStats />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </div>
                    </div>
                );

            case 'team':
                return (
                    <div className="p-6">
                        <SkeletonHeader />
                        <SkeletonTable />
                    </div>
                );

            case 'tasks':
                return (
                    <div className="p-6">
                        <SkeletonHeader />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </div>
                    </div>
                );

            case 'timeline':
                return (
                    <div className="p-6">
                        <SkeletonHeader />
                        <div className="space-y-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'progress':
                return (
                    <div className="p-6">
                        <SkeletonHeader />
                        <SkeletonStats />
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
                            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                    </div>
                );

            case 'documents':
                return (
                    <div className="p-6">
                        <SkeletonHeader />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="p-6">
                        <SkeletonHeader />
                        <div className="grid grid-cols-1 gap-6">
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </div>
                    </div>
                );
        }
    };

    return <div className="animate-fadeIn">{renderSkeleton()}</div>;
};

export default ProjectPageSkeleton;
