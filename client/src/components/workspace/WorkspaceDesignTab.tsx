import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Palette, Package, FileText, Loader } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import apiService from '../../services/api';
import FigmaFilePicker from '../figma/FigmaFilePicker';
import FigmaPreview from '../figma/FigmaPreview';
import { FigmaGuard } from '../guards';

const WorkspaceDesignTab: React.FC = () => {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const { state, addToast } = useApp();
    const [designs, setDesigns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showFilePicker, setShowFilePicker] = useState(false);
    const [activeCategory, setActiveCategory] = useState<'all' | 'brand' | 'template'>('all');

    const currentWorkspace = state.workspaces.find(w => w._id === workspaceId);
    const isOwner = currentWorkspace?.owner === state.userProfile._id;

    useEffect(() => {
        loadDesigns();
    }, [workspaceId]);

    const loadDesigns = async () => {
        if (!workspaceId) return;

        setIsLoading(true);
        try {
            const response = await apiService.get(`/figma/workspace/${workspaceId}/designs`);
            setDesigns(response.data?.designs || response.data || []);
        } catch (error: any) {
            console.error('Load designs error:', error);
            addToast('Failed to load designs', 'error');
            setDesigns([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUploaded = (file: any) => {
        setDesigns(prev => [file, ...prev]);
    };

    const handleApprove = async (designId: string, frameId: string) => {
        try {
            await apiService.post(`/figma/designs/${designId}/frames/${frameId}/approve`, {
                status: 'approved',
                role: 'team'
            });
            addToast('Design approved!', 'success');
            loadDesigns();
        } catch (error) {
            addToast('Failed to approve design', 'error');
        }
    };

    const handleReject = async (designId: string, frameId: string) => {
        try {
            await apiService.post(`/figma/designs/${designId}/frames/${frameId}/approve`, {
                status: 'rejected',
                role: 'team'
            });
            addToast('Design rejected', 'success');
            loadDesigns();
        } catch (error) {
            addToast('Failed to reject design', 'error');
        }
    };

    const filteredDesigns = activeCategory === 'all'
        ? designs.filter(d => d != null)
        : designs.filter(d => d != null && d.category === activeCategory);

    const brandAssets = designs.filter(d => d != null && d.category === 'brand');
    const templates = designs.filter(d => d != null && d.category === 'template');

    return (
        <FigmaGuard>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Design Library
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Manage your workspace's design system and brand assets
                        </p>
                    </div>
                    {isOwner && (
                        <button
                            onClick={() => setShowFilePicker(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={18} />
                            Add Design
                        </button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Palette size={24} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Brand Assets</div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{brandAssets.length}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Package size={24} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Templates</div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{templates.length}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <FileText size={24} className="text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Designs</div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{designs.length}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 border-b border-gray-300 dark:border-gray-700">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`px-4 py-2 font-medium transition-colors ${activeCategory === 'all'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        All Designs
                    </button>
                    <button
                        onClick={() => setActiveCategory('brand')}
                        className={`px-4 py-2 font-medium transition-colors ${activeCategory === 'brand'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Brand Assets
                    </button>
                    <button
                        onClick={() => setActiveCategory('template')}
                        className={`px-4 py-2 font-medium transition-colors ${activeCategory === 'template'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Templates
                    </button>
                </div>

                {/* Designs Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader size={32} className="animate-spin text-blue-600" />
                    </div>
                ) : filteredDesigns.length === 0 ? (
                    <div className="text-center py-12">
                        <Palette size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No designs yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Start building your design library by adding Figma files
                        </p>
                        {isOwner && (
                            <button
                                onClick={() => setShowFilePicker(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus size={18} />
                                Add First Design
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredDesigns.map((design) => (
                            <FigmaPreview
                                key={design._id}
                                fileId={design.fileId}
                                fileName={design.fileName}
                                fileUrl={design.fileUrl}
                                thumbnail={design.thumbnail}
                                frames={design.frames}
                                status={design.status}
                                onApprove={() => handleApprove(design._id, design.frames[0]?.frameId)}
                                onReject={() => handleReject(design._id, design.frames[0]?.frameId)}
                            />
                        ))}
                    </div>
                )}

                {/* File Picker Modal */}
                {showFilePicker && workspaceId && (
                    <FigmaFilePicker
                        workspaceId={workspaceId}
                        category={activeCategory === 'all' ? 'brand' : activeCategory}
                        visibility="workspace"
                        onFileUploaded={handleFileUploaded}
                        onClose={() => setShowFilePicker(false)}
                    />
                )}
            </div>
        </FigmaGuard>
    );
};

export default WorkspaceDesignTab;
