import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, ArrowLeft, Save, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';
import BannerCanvasEditor, { BannerCanvasEditorRef } from './BannerCanvasEditor';

interface BannerData {
    title: string;
    content: string;
    backgroundColor: string;
    textColor: string;
    imageUrl: string;
    height: number;
    fontSize: number;
    fontWeight: number;
    fontFamily?: string;
    type: 'text' | 'image' | 'both';
    imageWidth?: number;
    imageHeight?: number;
    padding?: number;
    borderRadius?: number;
    backgroundType?: 'solid' | 'image' | 'transparent' | 'gradient';
    gradientStart?: string;
    gradientEnd?: string;
    gradientDirection?: string;
}

const CanvasEditorPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode } = useTheme();
    const { addToast } = useApp();
    const canvasEditorRef = useRef<BannerCanvasEditorRef>(null);

    // Get banner data from navigation state or use defaults
    const [bannerData, setBannerData] = useState<BannerData>(location.state?.banner || {
        title: 'New Banner',
        content: '',
        backgroundColor: '#FF006B',
        textColor: '#FFFFFF',
        imageUrl: '',
        height: 200,
        fontSize: 16,
        fontWeight: 700,
        type: 'text',
        padding: 16,
        borderRadius: 0
    });

    const [exportedImage, setExportedImage] = useState<string | null>(null);
    const [autoSaving, setAutoSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [brushSize, setBrushSize] = useState(5);

    // Listen for banner data from parent window
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;

            if (event.data.type === 'BANNER_DATA' && event.data.data) {
                console.log('Received banner data:', event.data.data);
                setBannerData(event.data.data);
            }
        };

        window.addEventListener('message', handleMessage);

        if (window.opener) {
            window.opener.postMessage({ type: 'REQUEST_BANNER_DATA' }, window.location.origin);
        }

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    // Auto-save functionality with debouncing
    useEffect(() => {
        const saveTimer = setTimeout(() => {
            autoSave();
        }, 1000); // Auto-save after 1 second of no changes

        return () => clearTimeout(saveTimer);
    }, [bannerData]);

    const autoSave = useCallback(() => {
        setAutoSaving(true);
        // Store in localStorage
        localStorage.setItem('canvasBannerData', JSON.stringify(bannerData));
        localStorage.setItem('canvasBannerDataTime', Date.now().toString());

        // Notify parent window
        if (window.opener) {
            window.opener.postMessage({
                type: 'BANNER_UPDATE',
                data: bannerData
            }, window.location.origin);
        }

        setLastSaved(new Date());
        setTimeout(() => setAutoSaving(false), 500);
    }, [bannerData]);

    const handleExport = async (dataUrl: string) => {
        try {
            // Convert base64 to blob
            const res = await fetch(dataUrl);
            const blob = await res.blob();

            // Create form data
            const formData = new FormData();
            formData.append('image', blob, 'banner.png');

            // Upload to server
            addToast('Uploading banner to server...', 'info');
            const uploadRes = await api.upload<{ imageUrl: string }>('/content/banners/upload-image', formData);

            if (uploadRes.success && uploadRes.data) {
                const serverUrl = uploadRes.data.imageUrl;
                setExportedImage(serverUrl);
                setBannerData(prev => ({ ...prev, imageUrl: serverUrl }));
                addToast('Canvas exported and saved to server!', 'success');
            }
        } catch (error) {
            console.error('Upload failed', error);
            addToast('Failed to upload banner to server', 'error');
        }
    };

    const handleFinishEditing = () => {
        // Auto-trigger export if not already exported
        if (!exportedImage) {
            addToast('Exporting canvas...', 'info');
            // Trigger export via ref
            if (canvasEditorRef.current) {
                canvasEditorRef.current.triggerExport();
            }
            // Wait for export to complete (the handleExport callback will set exportedImage)
            // We'll need to call this function again after export completes
            setTimeout(() => {
                if (exportedImage) {
                    handleFinishEditing(); // Retry after export
                } else {
                    addToast('Export in progress, please wait...', 'warning');
                }
            }, 1000);
            return;
        }

        // Final save with exported image
        const finalData = {
            ...bannerData,
            imageUrl: exportedImage,
            type: 'image' as const, // Set to image type since we're using canvas export
            backgroundType: bannerData.backgroundType,
            gradientStart: bannerData.gradientStart,
            gradientEnd: bannerData.gradientEnd,
            gradientDirection: bannerData.gradientDirection,
            fontFamily: bannerData.fontFamily
        };

        // Notify parent window
        if (window.opener) {
            window.opener.postMessage({
                type: 'CANVAS_COMPLETE',
                data: finalData
            }, window.location.origin);
        }

        // Store in localStorage as backup
        localStorage.setItem('canvasFinalData', JSON.stringify(finalData));
        localStorage.setItem('canvasFinalDataTime', Date.now().toString());

        addToast('Changes saved! Closing editor...', 'success');
        setTimeout(() => {
            window.close();
        }, 500);
    };

    const updateBannerProperty = (key: keyof BannerData, value: any) => {
        setBannerData(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950' : 'bg-gradient-to-b from-gray-50 via-white to-white'}`}>
            {/* Header */}
            <div className={`${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white border-gray-200'} border-b sticky top-0 z-10 backdrop-blur-sm`}>
                <div className="max-w-[98vw] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleFinishEditing}
                                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                                title="Back"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Canvas Editor - {bannerData.title}
                                </h1>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {autoSaving ? (
                                        <span className="flex items-center gap-1">
                                            <Save className="w-3 h-3 animate-pulse" />
                                            Saving...
                                        </span>
                                    ) : lastSaved ? (
                                        <span className="flex items-center gap-1">
                                            <Check className="w-3 h-3 text-green-500" />
                                            Last saved: {lastSaved.toLocaleTimeString()}
                                        </span>
                                    ) : (
                                        'Create and edit your banner design'
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {!exportedImage && (
                                <div className={`px-3 py-1 rounded-lg ${isDarkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'} text-sm font-medium`}>
                                    ⚠️ Export canvas first!
                                </div>
                            )}
                            <button
                                onClick={handleFinishEditing}
                                disabled={!exportedImage}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${exportedImage
                                    ? 'bg-accent hover:bg-accent-hover text-gray-900'
                                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                    }`}
                                title={exportedImage ? 'Save and close' : 'Please export canvas first'}
                            >
                                <Check className="w-5 h-5" />
                                Finish Editing
                            </button>
                            <button
                                onClick={() => window.close()}
                                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                                title="Close"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Canvas + Properties */}
            <div className="max-w-[98vw] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Properties Sidebar */}
                    <div className={`lg:col-span-1 ${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white border-gray-200'} border rounded-2xl p-6 shadow-xl h-fit sticky top-24`}>
                        <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Banner Properties
                        </h3>

                        <div className="space-y-4">
                            {/* Image Width */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Image Width (px)
                                </label>
                                <input
                                    type="number"
                                    value={bannerData.imageWidth || ''}
                                    onChange={(e) => updateBannerProperty('imageWidth', e.target.value ? parseInt(e.target.value) : undefined)}
                                    placeholder="Auto"
                                    className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                />
                            </div>

                            {/* Image Height */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Image Height (px)
                                </label>
                                <input
                                    type="number"
                                    value={bannerData.imageHeight || ''}
                                    onChange={(e) => updateBannerProperty('imageHeight', e.target.value ? parseInt(e.target.value) : undefined)}
                                    placeholder="Auto"
                                    className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                />
                            </div>

                            {/* Background */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Background
                                </label>
                                <select
                                    value={bannerData.backgroundType || 'solid'}
                                    onChange={(e) => updateBannerProperty('backgroundType', e.target.value)}
                                    className={`w-full px-3 py-2 rounded-lg border mb-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                >
                                    <option value="solid">Solid Color</option>
                                    <option value="gradient">Gradient</option>
                                    <option value="image">Image</option>
                                    <option value="transparent">Transparent</option>
                                </select>

                                {(!bannerData.backgroundType || bannerData.backgroundType === 'solid') && (
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={bannerData.backgroundColor}
                                            onChange={(e) => updateBannerProperty('backgroundColor', e.target.value)}
                                            className="w-12 h-10 rounded cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={bannerData.backgroundColor}
                                            onChange={(e) => updateBannerProperty('backgroundColor', e.target.value)}
                                            className={`flex-1 px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                        />
                                    </div>
                                )}

                                {bannerData.backgroundType === 'gradient' && (
                                    <div className="space-y-2">
                                        <div className="flex gap-2 items-center">
                                            <span className="text-xs w-12">Start</span>
                                            <input
                                                type="color"
                                                value={bannerData.gradientStart || '#ffffff'}
                                                onChange={(e) => updateBannerProperty('gradientStart', e.target.value)}
                                                className="w-8 h-8 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={bannerData.gradientStart || '#ffffff'}
                                                onChange={(e) => updateBannerProperty('gradientStart', e.target.value)}
                                                className={`flex-1 px-2 py-1 text-sm rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                            />
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <span className="text-xs w-12">End</span>
                                            <input
                                                type="color"
                                                value={bannerData.gradientEnd || '#000000'}
                                                onChange={(e) => updateBannerProperty('gradientEnd', e.target.value)}
                                                className="w-8 h-8 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={bannerData.gradientEnd || '#000000'}
                                                onChange={(e) => updateBannerProperty('gradientEnd', e.target.value)}
                                                className={`flex-1 px-2 py-1 text-sm rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                            />
                                        </div>
                                        <select
                                            value={bannerData.gradientDirection || 'to right'}
                                            onChange={(e) => updateBannerProperty('gradientDirection', e.target.value)}
                                            className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                        >
                                            <option value="to right">Left to Right</option>
                                            <option value="to bottom">Top to Bottom</option>
                                            <option value="to bottom right">Diagonal (TL-BR)</option>
                                            <option value="to top right">Diagonal (BL-TR)</option>
                                        </select>
                                    </div>
                                )}

                                {bannerData.backgroundType === 'image' && (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = (event) => {
                                                            updateBannerProperty('imageUrl', event.target?.result as string);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className={`flex-1 px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs">or</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Enter image URL"
                                            value={bannerData.imageUrl || ''}
                                            onChange={(e) => updateBannerProperty('imageUrl', e.target.value)}
                                            className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Text Color */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Text Color
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={bannerData.textColor}
                                        onChange={(e) => updateBannerProperty('textColor', e.target.value)}
                                        className="w-12 h-10 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={bannerData.textColor}
                                        onChange={(e) => updateBannerProperty('textColor', e.target.value)}
                                        className={`flex-1 px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                    />
                                </div>
                            </div>

                            {/* Font Size */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Font Size: {bannerData.fontSize}px
                                </label>
                                <input
                                    type="range"
                                    min="8"
                                    max="72"
                                    value={bannerData.fontSize}
                                    onChange={(e) => updateBannerProperty('fontSize', parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            {/* Font Weight */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Font Weight: {bannerData.fontWeight}
                                </label>
                                <select
                                    value={bannerData.fontWeight}
                                    onChange={(e) => updateBannerProperty('fontWeight', parseInt(e.target.value))}
                                    className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                >
                                    <option value="100">Thin (100)</option>
                                    <option value="200">Extra Light (200)</option>
                                    <option value="300">Light (300)</option>
                                    <option value="400">Normal (400)</option>
                                    <option value="500">Medium (500)</option>
                                    <option value="600">Semi Bold (600)</option>
                                    <option value="700">Bold (700)</option>
                                    <option value="800">Extra Bold (800)</option>
                                    <option value="900">Black (900)</option>
                                </select>
                            </div>

                            {/* Font Family */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Font Family
                                </label>
                                <select
                                    value={bannerData.fontFamily || 'Arial'}
                                    onChange={(e) => updateBannerProperty('fontFamily', e.target.value)}
                                    className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                >
                                    <option value="Arial">Arial</option>
                                    <option value="'Times New Roman', Times, serif">Times New Roman</option>
                                    <option value="Georgia, serif">Georgia</option>
                                    <option value="Verdana, sans-serif">Verdana</option>
                                    <option value="'Courier New', Courier, monospace">Courier New</option>
                                    <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
                                    <option value="Impact, fantasy">Impact</option>
                                    <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                                    <option value="'Lucida Console', Monaco, monospace">Lucida Console</option>
                                    <option value="Tahoma, sans-serif">Tahoma</option>
                                    <option value="'Palatino Linotype', 'Book Antiqua', Palatino, serif">Palatino</option>
                                    <option value="Garamond, serif">Garamond</option>
                                </select>
                            </div>

                            {/* Height */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Height: {bannerData.height}px
                                </label>
                                <input
                                    type="range"
                                    min="40"
                                    max="400"
                                    value={bannerData.height}
                                    onChange={(e) => updateBannerProperty('height', parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            {/* Padding */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Padding: {bannerData.padding}px
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={bannerData.padding || 16}
                                    onChange={(e) => updateBannerProperty('padding', parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            {/* Border Radius */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Border Radius: {bannerData.borderRadius}px
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={bannerData.borderRadius || 0}
                                    onChange={(e) => updateBannerProperty('borderRadius', parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            {/* Brush Size */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Brush/Eraser Size: {brushSize}px
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={brushSize}
                                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Canvas Editor */}
                    <div className="lg:col-span-3">
                        <div className={`${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white border-gray-200'} border rounded-2xl p-6 shadow-xl`}>
                            <BannerCanvasEditor
                                ref={canvasEditorRef}
                                width={bannerData.imageWidth || Math.min(1200, window.innerWidth - 400)}
                                height={bannerData.height || 200}
                                backgroundColor={bannerData.backgroundColor}
                                backgroundImage={bannerData.backgroundType === 'image' ? bannerData.imageUrl : undefined}
                                backgroundType={bannerData.backgroundType || 'solid'}
                                gradientStart={bannerData.gradientStart}
                                gradientEnd={bannerData.gradientEnd}
                                gradientDirection={bannerData.gradientDirection}
                                initialText={(bannerData.type === 'text' || bannerData.type === 'both') ? bannerData.content : undefined}
                                initialImage={(bannerData.type === 'image' || bannerData.type === 'both') ? bannerData.imageUrl : undefined}
                                textColor={bannerData.textColor}
                                fontSize={bannerData.fontSize}
                                fontWeight={bannerData.fontWeight}
                                fontFamily={bannerData.fontFamily || 'Arial'}
                                padding={bannerData.padding}
                                borderRadius={bannerData.borderRadius}
                                brushSize={brushSize}
                                onExport={handleExport}
                            />
                        </div>

                        {exportedImage && (
                            <div className={`mt-6 ${isDarkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
                                <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                                    ✅ Canvas exported! Click "Finish Editing" to save and return.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CanvasEditorPage;
