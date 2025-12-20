import React, { useState } from 'react';
import { Mic, Calendar, Video, Link as LinkIcon, Save, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useDock } from '../context/DockContext';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import GlassmorphicPageHeader from './ui/GlassmorphicPageHeader';
import MeetingRecorder from './meeting/MeetingRecorder';

const MeetingNotesPage: React.FC = () => {
    const { isDarkMode, preferences } = useTheme();
    const { dockPosition } = useDock();
    const { dispatch } = useApp();
    const navigate = useNavigate();

    const [platform, setPlatform] = useState<string>('in-person');
    const [meetingLink, setMeetingLink] = useState('');
    const [meetingTitle, setMeetingTitle] = useState('');
    const [manualNotes, setManualNotes] = useState('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    // Get current date and time
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const platforms = [
        { value: 'google-meet', label: 'Google Meet', icon: Video },
        { value: 'zoom', label: 'Zoom', icon: Video },
        { value: 'teams', label: 'Microsoft Teams', icon: Video },
        { value: 'in-person', label: 'In-Person', icon: Calendar },
    ];

    // Open meeting link in new tab
    const openMeetingLink = () => {
        if (!meetingLink.trim()) {
            dispatch({
                type: 'ADD_TOAST',
                payload: {
                    message: 'Please enter a meeting link',
                    type: 'error'
                }
            });
            return;
        }

        // Ensure the link has a protocol
        let url = meetingLink.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        // Open in new tab
        window.open(url, '_blank', 'noopener,noreferrer');

        dispatch({
            type: 'ADD_TOAST',
            payload: {
                message: 'Meeting opened in new tab',
                type: 'success'
            }
        });
    };

    // Save manual notes to /notes
    const saveManualNotes = async () => {
        if (!manualNotes.trim()) {
            dispatch({
                type: 'ADD_TOAST',
                payload: {
                    message: 'Please enter some notes to save',
                    type: 'error'
                }
            });
            return;
        }

        setIsSavingNotes(true);

        try {
            // Generate title: use meeting title if provided, otherwise use timestamp
            const title = meetingTitle.trim() || `Meeting Notes - ${now.toLocaleString()}`;

            const noteData = {
                title,
                content: manualNotes,
                isSticky: false
            };

            await apiService.post('/notes', noteData);

            dispatch({
                type: 'ADD_TOAST',
                payload: {
                    message: 'Notes saved successfully!',
                    type: 'success'
                }
            });

            // Clear the manual notes after saving
            setManualNotes('');
            setMeetingTitle('');

            // Optionally navigate to notes page
            setTimeout(() => {
                navigate('/notes');
            }, 1500);
        } catch (error) {
            console.error('Error saving notes:', error);
            dispatch({
                type: 'ADD_TOAST',
                payload: {
                    message: 'Failed to save notes',
                    type: 'error'
                }
            });
        } finally {
            setIsSavingNotes(false);
        }
    };

    return (
        <div
            className={`min-h-screen flex flex-col ${isDarkMode
                    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
                    : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20'
                }`}
        >
            <div
                className="p-4 sm:p-6 transition-all duration-300"
                style={{
                    paddingLeft: dockPosition === 'left' ? '80px' : undefined,
                    paddingRight: dockPosition === 'right' ? '80px' : undefined,
                }}
            >
                {/* Page Header */}
                <GlassmorphicPageHeader
                    icon={Mic}
                    title="New Meeting Note"
                    subtitle={`${dateStr} at ${timeStr}`}
                />

                {/* Meeting Title Input */}
                <div className="mt-6">
                    <div
                        className={`p-4 rounded-2xl border backdrop-blur-sm ${isDarkMode
                                ? 'bg-gray-800/50 border-gray-700/50'
                                : 'bg-white/80 border-gray-200/50 shadow-lg'
                            }`}
                    >
                        <label
                            className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}
                        >
                            Meeting Title (Optional)
                        </label>
                        <input
                            type="text"
                            value={meetingTitle}
                            onChange={(e) => setMeetingTitle(e.target.value)}
                            placeholder="e.g., Q4 Planning Meeting, Sprint Review..."
                            className={`w-full px-4 py-3 rounded-xl border transition-all ${isDarkMode
                                    ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-gray-600'
                                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300'
                                } focus:outline-none`}
                        />
                        <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            If left empty, notes will be saved with a timestamp
                        </p>
                    </div>
                </div>

                {/* Platform Selector */}
                <div className="mt-6">
                    <div
                        className={`p-4 rounded-2xl border backdrop-blur-sm ${isDarkMode
                                ? 'bg-gray-800/50 border-gray-700/50'
                                : 'bg-white/80 border-gray-200/50 shadow-lg'
                            }`}
                    >
                        <label
                            className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}
                        >
                            Meeting Platform
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {platforms.map((p) => {
                                const Icon = p.icon;
                                const isSelected = platform === p.value;
                                return (
                                    <button
                                        key={p.value}
                                        onClick={() => setPlatform(p.value)}
                                        className={`p-4 rounded-xl border transition-all ${isSelected
                                                ? isDarkMode
                                                    ? 'bg-gray-700/50 border-gray-600'
                                                    : 'bg-white border-gray-300 shadow-md'
                                                : isDarkMode
                                                    ? 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-700/30'
                                                    : 'bg-white/50 border-gray-200/50 hover:bg-white/80'
                                            }`}
                                        style={
                                            isSelected
                                                ? {
                                                    borderColor: preferences.accentColor,
                                                    boxShadow: `0 0 0 1px ${preferences.accentColor}40`,
                                                }
                                                : undefined
                                        }
                                    >
                                        <Icon
                                            className={`w-5 h-5 mx-auto mb-2 ${isSelected
                                                    ? isDarkMode
                                                        ? 'text-white'
                                                        : 'text-gray-900'
                                                    : isDarkMode
                                                        ? 'text-gray-400'
                                                        : 'text-gray-600'
                                                }`}
                                            style={isSelected ? { color: preferences.accentColor } : undefined}
                                        />
                                        <div
                                            className={`text-sm font-medium ${isSelected
                                                    ? isDarkMode
                                                        ? 'text-white'
                                                        : 'text-gray-900'
                                                    : isDarkMode
                                                        ? 'text-gray-400'
                                                        : 'text-gray-600'
                                                }`}
                                        >
                                            {p.label}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Meeting Link Input (for online platforms) */}
                {platform !== 'in-person' && (
                    <div className="mt-6">
                        <div
                            className={`p-4 rounded-2xl border backdrop-blur-sm ${isDarkMode
                                    ? 'bg-gray-800/50 border-gray-700/50'
                                    : 'bg-white/80 border-gray-200/50 shadow-lg'
                                }`}
                        >
                            <label
                                className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}
                            >
                                <LinkIcon className="w-4 h-4 inline mr-2" />
                                Meeting Link
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={meetingLink}
                                    onChange={(e) => setMeetingLink(e.target.value)}
                                    placeholder={`Paste your ${platforms.find(p => p.value === platform)?.label} link here...`}
                                    className={`flex-1 px-4 py-3 rounded-xl border transition-all ${isDarkMode
                                            ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-gray-600'
                                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300'
                                        } focus:outline-none`}
                                />
                                <button
                                    onClick={openMeetingLink}
                                    disabled={!meetingLink.trim()}
                                    style={{
                                        background: meetingLink.trim()
                                            ? `linear-gradient(135deg, ${preferences.accentColor} 0%, ${preferences.accentColor}dd 100%)`
                                            : undefined,
                                    }}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${meetingLink.trim()
                                            ? 'text-white hover:opacity-90 shadow-lg'
                                            : isDarkMode
                                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <ExternalLink className="w-5 h-5" />
                                    Join
                                </button>
                            </div>
                            <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                The meeting will open in a new tab. Then enable "Include System Audio" below to record it.
                            </p>
                        </div>
                    </div>
                )}

                {/* Info Banner for System Audio */}
                {platform !== 'in-person' && (
                    <div
                        className={`mt-6 p-4 rounded-xl border ${isDarkMode
                                ? 'bg-blue-900/20 border-blue-700/50'
                                : 'bg-blue-50 border-blue-200'
                            }`}
                    >
                        <div className="flex items-start">
                            <Video
                                className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'
                                    }`}
                            />
                            <div>
                                <p
                                    className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'
                                        }`}
                                >
                                    <strong>Tip:</strong> To capture audio from {platforms.find(p => p.value === platform)?.label},
                                    enable "Include System Audio" below and select the meeting tab when prompted.
                                    Make sure to check "Share audio" in the browser dialog.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Recorder Component */}
                <div className="mt-6">
                    <MeetingRecorder
                        manualNotes={manualNotes}
                        onManualNotesChange={setManualNotes}
                    />
                </div>

                {/* Save Manual Notes Button */}
                {manualNotes.trim() && (
                    <div className="mt-6">
                        <button
                            onClick={saveManualNotes}
                            disabled={isSavingNotes}
                            style={{
                                background: `linear-gradient(135deg, ${preferences.accentColor} 0%, ${preferences.accentColor}dd 100%)`,
                            }}
                            className="w-full px-6 py-4 text-white rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSavingNotes ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Notes to /notes
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MeetingNotesPage;
