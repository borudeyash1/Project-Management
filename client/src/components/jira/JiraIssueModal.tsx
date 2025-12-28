import React, { useState, useEffect } from 'react';
import { X, Plus, Loader } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import apiService from '../../services/api';

interface JiraIssueModalProps {
    workspaceId: string;
    onClose: () => void;
    onCreated: () => void;
}

const JiraIssueModal: React.FC<JiraIssueModalProps> = ({ workspaceId, onClose, onCreated }) => {
    const { addToast } = useApp();
    const [projects, setProjects] = useState<any[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const [formData, setFormData] = useState({
        projectKey: '',
        summary: '',
        description: '',
        issueType: 'Task',
        priority: 'Medium'
    });

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setIsLoadingProjects(true);
            const response = await apiService.get(`/jira/workspace/${workspaceId}/projects`);
            // apiService already unwraps response.data
            setProjects(response.data || []);
        } catch (error: any) {
            addToast('Failed to load Jira spaces', 'error');
        } finally {
            setIsLoadingProjects(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.projectKey || !formData.summary) {
            addToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            setIsCreating(true);
            await apiService.post(`/jira/workspace/${workspaceId}/issues`, formData);
            addToast('Issue created successfully in Jira', 'success');
            onCreated();
            onClose();
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to create issue', 'error');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Create Jira Issue
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Space */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Space <span className="text-red-500">*</span>
                        </label>
                        {isLoadingProjects ? (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Loader size={16} className="animate-spin" />
                                Loading spaces...
                            </div>
                        ) : (
                            <select
                                value={formData.projectKey}
                                onChange={(e) => setFormData({ ...formData, projectKey: e.target.value })}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            >
                                <option value="">Select a space...</option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.key}>
                                        {project.name} ({project.key})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Summary */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Summary <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.summary}
                            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                            required
                            placeholder="Brief description of the issue"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            placeholder="Detailed description of the issue"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Issue Type & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Issue Type
                            </label>
                            <select
                                value={formData.issueType}
                                onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            >
                                <option value="Task">Task</option>
                                <option value="Story">Story</option>
                                <option value="Bug">Bug</option>
                                <option value="Epic">Epic</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Priority
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            >
                                <option value="Highest">Highest</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                                <option value="Lowest">Lowest</option>
                            </select>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        type="button"
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isCreating || !formData.projectKey || !formData.summary}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCreating ? (
                            <>
                                <Loader size={18} className="animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus size={18} />
                                Create Issue
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JiraIssueModal;
