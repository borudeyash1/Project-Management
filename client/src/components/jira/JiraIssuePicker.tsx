import React, { useState, useEffect } from 'react';
import { X, Search, Download, Loader } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import apiService from '../../services/api';

interface JiraIssuePickerProps {
    workspaceId: string;
    onClose: () => void;
    onImported: () => void;
}

const JiraIssuePicker: React.FC<JiraIssuePickerProps> = ({ workspaceId, onClose, onImported }) => {
    const { addToast } = useApp();
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [jql, setJql] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.get(`/jira/workspace/${workspaceId}/projects`);
            console.log('[JIRA PICKER] Full response:', response);
            console.log('[JIRA PICKER] response.data:', response.data);
            // apiService already unwraps response.data, so response.data is the array directly
            setProjects(response.data || []);
        } catch (error: any) {
            addToast('Failed to load Jira spaces', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImport = async () => {
        if (!selectedProject && !jql) {
            addToast('Please select a project or enter a JQL query', 'error');
            return;
        }

        try {
            setIsImporting(true);
            const response = await apiService.post(`/jira/workspace/${workspaceId}/import`, {
                projectKey: selectedProject,
                jql
            });

            // apiService unwraps response.data, so response.data is the actual data array
            const count = response.data?.length || 0;
            addToast(`Successfully imported ${count} issue${count !== 1 ? 's' : ''} from Jira`, 'success');
            onImported();
            onClose();
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to import issues', 'error');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Import Jira Issues
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Project Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Space
                        </label>
                        {isLoading ? (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Loader size={16} className="animate-spin" />
                                Loading spaces...
                            </div>
                        ) : (
                            <select
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
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
                        <p className="mt-1 text-sm text-gray-500">
                            Import all issues from the selected space
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">OR</span>
                        </div>
                    </div>

                    {/* JQL Query */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Custom JQL Query
                        </label>
                        <textarea
                            value={jql}
                            onChange={(e) => setJql(e.target.value)}
                            placeholder="e.g., project = PROJ AND status = 'In Progress' ORDER BY created DESC"
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Use JQL (Jira Query Language) for advanced filtering
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Search size={16} />
                            Import Tips
                        </h3>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                            <li>Select a space to import all its issues</li>
                            <li>Use JQL for custom queries (e.g., specific sprints, assignees)</li>
                            <li>Issues will be synced with their current status and metadata</li>
                            <li>You can sync again later to update changes from Jira</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={isImporting || (!selectedProject && !jql)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isImporting ? (
                            <>
                                <Loader size={18} className="animate-spin" />
                                Importing...
                            </>
                        ) : (
                            <>
                                <Download size={18} />
                                Import Issues
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JiraIssuePicker;
