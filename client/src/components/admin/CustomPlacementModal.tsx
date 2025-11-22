import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Move, Maximize } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface CustomPlacementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { x: number; y: number; width: number }) => void;
    initialData?: { x: number; y: number; width: number };
    bannerPreviewUrl?: string; // Optional: show the actual banner image
}

const CustomPlacementModal: React.FC<CustomPlacementModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    bannerPreviewUrl
}) => {
    const { isDarkMode } = useTheme();
    const [x, setX] = useState(initialData?.x || 50);
    const [y, setY] = useState(initialData?.y || 50);
    const [width, setWidth] = useState(initialData?.width || 300);

    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({ x: 0, width: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const previewScale = 0.6; // Scale down the preview area

    useEffect(() => {
        if (isOpen && initialData) {
            setX(initialData.x || 50);
            setY(initialData.y || 50);
            setWidth(initialData.width || 300);
        }
    }, [isOpen, initialData]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - x, y: e.clientY - y });
        }
    };

    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsResizing(true);
        setResizeStart({ x: e.clientX, width: width });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;

            // Constrain to container
            // For simplicity, allowing some overflow but generally keeping it in bounds
            setX(Math.max(0, newX));
            setY(Math.max(0, newY));
        } else if (isResizing) {
            const deltaX = e.clientX - resizeStart.x;
            setWidth(Math.max(100, resizeStart.width + deltaX));
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-xl shadow-2xl w-[90vw] max-w-4xl h-[80vh] flex flex-col`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold">Custom Banner Placement</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Preview Area */}
                    <div
                        className="flex-1 bg-gray-100 dark:bg-gray-900 relative overflow-hidden p-8 flex items-center justify-center"
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        {/* Mock Page Container */}
                        <div
                            ref={containerRef}
                            className="bg-white dark:bg-gray-800 shadow-lg relative"
                            style={{
                                width: '100%',
                                height: '100%',
                                maxWidth: '1200px',
                                border: '1px dashed #ccc'
                            }}
                        >
                            {/* Mock Header */}
                            <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 mb-4">
                                <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="ml-auto flex gap-4">
                                    <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                </div>
                            </div>

                            {/* Mock Content */}
                            <div className="p-4 grid grid-cols-3 gap-4">
                                <div className="col-span-2 h-64 bg-gray-100 dark:bg-gray-700/50 rounded"></div>
                                <div className="h-64 bg-gray-100 dark:bg-gray-700/50 rounded"></div>
                                <div className="col-span-3 h-32 bg-gray-100 dark:bg-gray-700/50 rounded"></div>
                            </div>

                            {/* Draggable Banner */}
                            <div
                                onMouseDown={handleMouseDown}
                                style={{
                                    position: 'absolute',
                                    left: x,
                                    top: y,
                                    width: width,
                                    height: 100, // Fixed height for preview or dynamic?
                                    cursor: isDragging ? 'grabbing' : 'grab',
                                    zIndex: 10,
                                    border: '2px solid #3b82f6',
                                    backgroundColor: bannerPreviewUrl ? 'transparent' : 'rgba(59, 130, 246, 0.2)',
                                    backgroundImage: bannerPreviewUrl ? `url(${bannerPreviewUrl})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                                className="group rounded shadow-lg flex items-center justify-center relative"
                            >
                                {!bannerPreviewUrl && (
                                    <span className="text-blue-500 font-medium select-none flex items-center gap-2">
                                        <Move size={16} /> Drag me
                                    </span>
                                )}

                                {/* Resize Handle */}
                                <div
                                    onMouseDown={handleResizeMouseDown}
                                    className="absolute right-0 top-0 bottom-0 w-4 cursor-ew-resize flex items-center justify-center hover:bg-blue-500/20 transition-colors"
                                >
                                    <div className="w-1 h-8 bg-blue-400 rounded-full"></div>
                                </div>

                                {/* Coordinates Label */}
                                <div className="absolute -top-8 left-0 bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                                    X: {Math.round(x)}, Y: {Math.round(y)}, W: {Math.round(width)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Controls */}
                    <div className="w-64 border-l border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-4 overflow-y-auto">
                        <h3 className="font-semibold">Coordinates</h3>

                        <div>
                            <label className="block text-sm text-gray-500 mb-1">X Position (px)</label>
                            <input
                                type="number"
                                value={Math.round(x)}
                                onChange={(e) => setX(parseInt(e.target.value) || 0)}
                                className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Y Position (px)</label>
                            <input
                                type="number"
                                value={Math.round(y)}
                                onChange={(e) => setY(parseInt(e.target.value) || 0)}
                                className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Width (px)</label>
                            <input
                                type="number"
                                value={Math.round(width)}
                                onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
                                className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                            />
                        </div>

                        <div className="mt-auto pt-4">
                            <button
                                onClick={() => onSave({ x, y, width })}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"
                            >
                                <Check size={18} />
                                Save Placement
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomPlacementModal;
