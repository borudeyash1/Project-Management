import React, { useState, useEffect } from 'react';
import { X, File, Folder, ChevronRight, Check } from 'lucide-react';

interface VaultFile {
    id: string;
    name: string;
    mimeType: string;
    webViewLink: string;
    iconLink: string;
}

interface VaultPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (files: VaultFile[]) => void;
    userEmail?: string;
}

const VaultPicker: React.FC<VaultPickerProps> = ({ isOpen, onClose, onSelect, userEmail }) => {
    const [files, setFiles] = useState<VaultFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<VaultFile[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchFiles();
        }
    }, [isOpen]);

    const fetchFiles = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('accessToken');
            // Using the Vault API endpoint directly or via proxy
            const response = await fetch('/api/vault/files', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch Vault files');
            }

            const data = await response.json();
            setFiles(data.files || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load files from Vault. Ensure Vault is connected.');
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (file: VaultFile) => {
        if (selectedFiles.find(f => f.id === file.id)) {
            setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
        } else {
            setSelectedFiles([...selectedFiles, file]);
        }
    };

    const handleConfirm = () => {
        onSelect(selectedFiles);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Select files from Vault</h2>
                        {userEmail && (
                            <p className="text-xs text-gray-500 mt-0.5">
                                📂 Connected Account: <span className="font-medium text-blue-600">{userEmail}</span>
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500 bg-red-50 rounded-lg">
                            <p>{error}</p>
                            <button onClick={fetchFiles} className="mt-2 text-sm text-blue-600 hover:underline">Retry</button>
                        </div>
                    ) : files.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Folder size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No files found in your Vault.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {files.map(file => {
                                const isSelected = !!selectedFiles.find(f => f.id === file.id);
                                return (
                                    <div
                                        key={file.id}
                                        onClick={() => toggleSelection(file)}
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                                ? 'border-blue-500 bg-blue-50/50'
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                                            }`}>
                                            {isSelected && <Check size={12} className="text-white" />}
                                        </div>

                                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded">
                                            <img src={file.iconLink} alt="" className="w-5 h-5" onError={(e) => (e.currentTarget.src = '')} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                            <p className="text-xs text-gray-500 truncate">Google Drive File</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={selectedFiles.length === 0}
                        className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-all ${selectedFiles.length > 0
                                ? 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20'
                                : 'bg-gray-300 cursor-not-allowed'
                            }`}
                    >
                        Attach {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VaultPicker;
