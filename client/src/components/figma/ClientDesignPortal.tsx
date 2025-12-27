import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { X, Loader, Eye, MessageSquare } from 'lucide-react';
import apiService from '../../services/api';
import FigmaPreview from '../figma/FigmaPreview';

interface ClientDesignPortalProps {
    clientId: string;
    onClose: () => void;
}

const ClientDesignPortal: React.FC<ClientDesignPortalProps> = ({ clientId, onClose }) => {
    const [designs, setDesigns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending');
    const { workspaceId } = useParams<{ workspaceId: string }>();

    useEffect(() => {
        loadClientDesigns();
    }, [clientId, workspaceId]);

    const loadClientDesigns = async () => {
        if (!workspaceId || !clientId) return;

        setIsLoading(true);
        try {
            const response = await apiService.get(`/figma/workspace/${workspaceId}/client/${clientId}/designs`);
            setDesigns(response.data?.designs || response.data || []);
        } catch (error) {
            console.error('Load client designs error:', error);
            setDesigns([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (designId: string, frameId: string) => {
        try {
            await apiService.post(`/figma/designs/${designId}/frames/${frameId}/approve`, {
                status: 'approved',
                role: 'client'
            });
            loadClientDesigns();
        } catch (error) {
            console.error('Approve error:', error);
        }
    };

    const handleReject = async (designId: string, frameId: string) => {
        try {
            await apiService.post(`/figma/designs/${designId}/frames/${frameId}/approve`, {
                status: 'rejected',
                role: 'client'
            });
            loadClientDesigns();
        } catch (error) {
            console.error('Reject error:', error);
        }
    };

    const filteredDesigns = designs.filter(design => {
        if (activeTab === 'pending') return design.status === 'client-review';
        if (activeTab === 'approved') return design.status === 'approved';
        return true;
    });

    const pendingCount = designs.filter(d => d.status === 'client-review').length;
    const approvedCount = designs.filter(d => d.status === 'approved').length;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-600">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            Design Review Portal
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Review and approve designs for your projects
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 px-6 pt-4 border-b border-gray-300 dark:border-gray-600">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`pb-3 px-2 font-medium transition-colors relative ${activeTab === 'pending'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Pending Review
                        {pendingCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                                {pendingCount}
                            </span>
                        )}
                        {activeTab === 'pending' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('approved')}
                        className={`pb-3 px-2 font-medium transition-colors relative ${activeTab === 'approved'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Approved
                        {approvedCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                                {approvedCount}
                            </span>
                        )}
                        {activeTab === 'approved' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`pb-3 px-2 font-medium transition-colors relative ${activeTab === 'all'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        All Designs ({designs.length})
                        {activeTab === 'all' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader size={32} className="animate-spin text-blue-600" />
                        </div>
                    ) : filteredDesigns.length === 0 ? (
                        <div className="text-center py-12">
                            <Eye size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No designs {activeTab === 'pending' ? 'pending review' : activeTab === 'approved' ? 'approved yet' : 'available'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {activeTab === 'pending'
                                    ? 'All designs have been reviewed'
                                    : 'Designs will appear here once shared with you'}
                            </p>
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
                                    onApprove={
                                        design.status === 'client-review'
                                            ? () => handleApprove(design._id, design.frames[0]?.frameId)
                                            : undefined
                                    }
                                    onReject={
                                        design.status === 'client-review'
                                            ? () => handleReject(design._id, design.frames[0]?.frameId)
                                            : undefined
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientDesignPortal;
