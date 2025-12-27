import React, { useState } from 'react';
import { X, Upload, Link as LinkIcon, Loader } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import apiService from '../../services/api';

interface FigmaFilePickerProps {
    workspaceId: string;
    projectId?: string;
    clientId?: string;
    category?: 'brand' | 'project' | 'template';
    visibility?: 'workspace' | 'client' | 'private';
    onFileUploaded?: (file: any) => void;
    onClose: () => void;
}

const FigmaFilePicker: React.FC<FigmaFilePickerProps> = ({
    workspaceId,
    projectId,
    clientId,
    category = 'project',
    visibility = 'workspace',
    onFileUploaded,
    onClose
}) => {
    const { addToast } = useApp();
    const [figmaUrl, setFigmaUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(category);
    const [selectedVisibility, setSelectedVisibility] = useState(visibility);

    const extractFileId = (url: string): string | null => {
        // Extract file ID from Figma URL
        // Format 1: https://www.figma.com/file/FILE_ID/...
        // Format 2: https://www.figma.com/design/FILE_ID/...
        const match = url.match(/figma\.com\/(file|design)\/([a-zA-Z0-9]+)/);
        return match ? match[2] : null;
    };

    const handleUpload = async () => {
        const fileId = extractFileId(figmaUrl);

        if (!fileId) {
            addToast('Invalid Figma URL. Please paste a valid Figma file link.', 'error');
            return;
        }

        setIsUploading(true);

        try {
            const response = await apiService.post(
                `/figma/workspace/${workspaceId}/designs`,
                { fileId, projectId, clientId, category: selectedCategory, visibility: selectedVisibility }
            );

            addToast('Figma file uploaded successfully!', 'success');
            onFileUploaded?.(response.data);
            onClose();
        } catch (error: any) {
            console.error('Upload error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to upload Figma file';

            // Check if it's a connection issue
            if (errorMessage.includes('Figma not connected') || errorMessage.includes('Invalid token')) {
                addToast(
                    'Please connect your Figma account in Settings → Connected Accounts first',
                    'error'
                );
            } else if (errorMessage.includes('rate limit')) {
                addToast(
                    'Figma API rate limit exceeded. Please wait a few minutes before trying again.',
                    'error'
                );
            } else if (errorMessage.includes('not found')) {
                addToast(
                    'Figma file not found. Please check the URL and try again.',
                    'error'
                );
            } else {
                addToast(errorMessage, 'error');
            }
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Upload Figma File
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Instructions */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Paste a Figma file URL to import it into your workspace.
                </p>

                {/* Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Figma File URL
                    </label>
                    <div className="relative">
                        <LinkIcon
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            value={figmaUrl}
                            onChange={(e) => setFigmaUrl(e.target.value)}
                            placeholder="https://www.figma.com/file/..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Settings */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Category
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm cursor-pointer"
                        >
                            <option value="brand">Brand</option>
                            <option value="project">Project</option>
                            <option value="template">Template</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Visibility
                        </label>
                        <select
                            value={selectedVisibility}
                            onChange={(e) => setSelectedVisibility(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm cursor-pointer"
                        >
                            <option value="workspace">Workspace</option>
                            <option value="client">Client</option>
                            <option value="private">Private</option>
                        </select>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!figmaUrl || isUploading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isUploading ? (
                            <>
                                <Loader size={18} className="animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload size={18} />
                                Upload
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FigmaFilePicker;
