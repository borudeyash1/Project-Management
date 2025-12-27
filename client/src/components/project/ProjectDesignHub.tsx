import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Palette, Upload, Link as LinkIcon, Loader, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import apiService from '../../services/api';
import FigmaFilePicker from '../figma/FigmaFilePicker';
import FigmaPreview from '../figma/FigmaPreview';
import { FigmaGuard } from '../guards';

const ProjectDesignHub: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { state, addToast } = useApp();
    const [designs, setDesigns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showFilePicker, setShowFilePicker] = useState(false);

    // Get project details
    const project = state.projects.find(p => p._id === projectId);
    const workspaceId = project?.workspace;
    const clientId = typeof project?.client === 'string' ? project.client : (project?.client as any)?._id;

    useEffect(() => {
        loadProjectDesigns();
    }, [projectId, workspaceId]);

    const loadProjectDesigns = async () => {
        if (!workspaceId || !projectId) return;

        setIsLoading(true);
        try {
            const response = await apiService.get(`/figma/workspace/${workspaceId}/project/${projectId}/designs`);
            setDesigns(response.data?.designs || response.data || []);
        } catch (error) {
            console.error('Load project designs error:', error);
            addToast('Failed to load project designs', 'error');
            setDesigns([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUploaded = (file: any) => {
        setDesigns(prev => [file, ...prev]);
        addToast('Design added to project!', 'success');
    };

    const handleRequestReview = async (designId: string) => {
        try {
            await apiService.put(`/figma/designs/${designId}/status`, {
                status: 'client-review'
            });
            addToast('Design sent for client review', 'success');
            loadProjectDesigns();
        } catch (error) {
            addToast('Failed to request review', 'error');
        }
    };

    const stats = {
        total: designs.filter(d => d != null).length,
        draft: designs.filter(d => d != null && d.status === 'draft').length,
        review: designs.filter(d => d != null && d.status === 'client-review').length,
        approved: designs.filter(d => d != null && d.status === 'approved').length
    };

    return (
        <FigmaGuard>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Project Designs
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Manage design files and mockups for {project?.name}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowFilePicker(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={18} />
                        Add Design
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Designs</div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Draft</div>
                        <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">{stats.draft}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Review</div>
                        <div className="text-3xl font-bold text-blue-600">{stats.review}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Approved</div>
                        <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
                    </div>
                </div>

                {/* Designs Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader size={32} className="animate-spin text-blue-600" />
                    </div>
                ) : designs.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
                        <Palette size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No designs yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Add Figma designs to this project to get started
                        </p>
                        <button
                            onClick={() => setShowFilePicker(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={18} />
                            Add First Design
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {designs
                            .filter((design, index, self) =>
                                design != null &&
                                index === self.findIndex(d => d?._id === design._id)
                            )
                            .map((design) => (
                                <div key={design._id} className="relative">
                                    <FigmaPreview
                                        fileId={design.fileId}
                                        fileName={design.fileName}
                                        fileUrl={design.fileUrl}
                                        thumbnail={design.thumbnail}
                                        frames={design.frames}
                                        status={design.status}
                                    />
                                    {/* Request Review Button */}
                                    {design.status === 'draft' && (
                                        <button
                                            onClick={() => handleRequestReview(design._id)}
                                            className="absolute bottom-4 left-4 right-4 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Request Client Review
                                        </button>
                                    )}
                                </div>
                            ))
                        }
                    </div>
                )}

                {/* File Picker Modal */}
                {showFilePicker && workspaceId && (
                    <FigmaFilePicker
                        workspaceId={workspaceId}
                        projectId={projectId}
                        clientId={clientId}
                        category="project"
                        visibility="client"
                        onFileUploaded={handleFileUploaded}
                        onClose={() => setShowFilePicker(false)}
                    />
                )}
            </div>
        </FigmaGuard>
    );
};

export default ProjectDesignHub;
