import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, FileText, Wand2, Save, Trash2, Plus, Mic } from 'lucide-react';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import ContentBanner from './ContentBanner';
import Header from './Header';
import DockNavigation from './DockNavigation';
import { apiService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useRefreshData } from '../hooks/useRefreshData';
import { useApp } from '../context/AppContext';
import { useDock } from '../context/DockContext'; import GlassmorphicPageHeader from './ui/GlassmorphicPageHeader';
import { useNavigate } from 'react-router-dom';

interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotesPage: React.FC = () => {
  const { t } = useTranslation();
  const { isDarkMode, preferences } = useTheme();
  const { dispatch } = useApp();
  const { dockPosition } = useDock();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiAction, setAiAction] = useState<'generate' | 'refine'>('generate');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      const data = await apiService.get('/notes') as unknown as Note[];
      setNotes(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Enable refresh button
  useRefreshData(fetchNotes, [fetchNotes]);

  const handleCreateNote = async () => {
    try {
      const newNoteData = {
        title: title || 'Untitled Note',
        content: content,
        isSticky: false
      };

      const createdNote = await apiService.post('/notes', newNoteData) as unknown as Note;
      setNotes([createdNote, ...notes]);
      setSelectedNote(createdNote);
      setTitle(createdNote.title);
      setContent(createdNote.content);
      setIsCreatingNew(false);

      dispatch({
        type: 'ADD_TOAST',
        payload: {
          message: 'Note created successfully!',
          type: 'success'
        }
      });
    } catch (error) {
      console.error('Error creating note:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          message: 'Failed to create note',
          type: 'error'
        }
      });
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;

    try {
      const updatedNote = await apiService.put(`/notes/${selectedNote._id}`, {
        title,
        content
      }) as unknown as Note;

      const updatedNotes = notes.map(note =>
        note._id === selectedNote._id ? updatedNote : note
      );
      setNotes(updatedNotes);
      setSelectedNote(updatedNote);

      dispatch({
        type: 'ADD_TOAST',
        payload: {
          message: 'Note saved successfully!',
          type: 'success'
        }
      });
    } catch (error) {
      console.error('Error saving note:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          message: 'Failed to save note',
          type: 'error'
        }
      });
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await apiService.delete(`/notes/${id}`);
      setNotes(notes.filter(note => note._id !== id));
      if (selectedNote?._id === id) {
        setSelectedNote(null);
        setTitle('');
        setContent('');
        setIsCreatingNew(false);
      }
      setDeleteConfirmId(null);

      dispatch({
        type: 'ADD_TOAST',
        payload: {
          message: 'Note deleted successfully!',
          type: 'success'
        }
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          message: 'Failed to delete note',
          type: 'error'
        }
      });
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsCreatingNew(false);
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: aiAction === 'generate'
            ? `Generate a detailed note about: ${aiPrompt}`
            : `Refine and improve this note:\n\n${content}\n\nInstructions: ${aiPrompt}`,
          userContext: {},
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (aiAction === 'generate') {
          setContent(data.data.response);
          setTitle(aiPrompt.slice(0, 50) + (aiPrompt.length > 50 ? '...' : ''));
        } else {
          setContent(data.data.response);
        }
        setShowAIModal(false);
        setAiPrompt('');
      }
    } catch (error) {
      console.error('AI generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20'}`}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        <div
          className="p-6 transition-all duration-300"
          style={{
            paddingLeft: dockPosition === 'left' ? 'calc(1.5rem + 100px)' : undefined,
            paddingRight: dockPosition === 'right' ? 'calc(1.5rem + 100px)' : undefined
          }}
        >
          {/* Glassmorphic Page Header */}
          <GlassmorphicPageHeader
            icon={FileText}
            title={t('notes.title')}
            subtitle={t('notes.subtitle')}
          />

          {/* Layout */}
          {isLoading ? (
            /* Loading Skeleton */
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-pulse">
              {/* Sidebar Skeleton */}
              <div className={`lg:col-span-1 rounded-2xl border p-6 h-[calc(100vh-300px)] ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 border-gray-200/50'
                }`}>
                <div className="h-12 bg-gradient-to-r from-yellow-200 to-amber-200 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-xl mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`h-16 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`} />
                  ))}
                </div>
              </div>

              {/* Editor Skeleton */}
              <div className={`lg:col-span-3 rounded-2xl border p-6 h-[calc(100vh-300px)] ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 border-gray-200/50'
                }`}>
                <div className="flex gap-3 mb-6">
                  <div className="h-10 w-40 bg-gradient-to-r from-purple-200 to-purple-300 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl" />
                  <div className="h-10 w-40 bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl" />
                </div>
                <div className={`h-12 rounded-xl mb-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`} />
                <div className={`h-64 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Notes List Sidebar */}
              <div className={`lg:col-span-1 rounded-2xl border p-6 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar ${isDarkMode
                ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm'
                : 'bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-lg'
                }`}>
                <button
                  onClick={() => {
                    setSelectedNote(null);
                    setTitle('');
                    setContent('');
                    setIsCreatingNew(true);
                  }}
                  style={{
                    background: `linear-gradient(135deg, ${preferences.accentColor} 0%, ${preferences.accentColor}dd 100%)`
                  }}
                  className="w-full flex items-center justify-center gap-2 hover:opacity-90 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg mb-4"
                >
                  <Plus size={20} />
                  {t('notes.newNote')}
                </button>

                <div className="space-y-2">
                  {notes.length === 0 ? (
                    <div className="text-center py-12">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                        <FileText className={`w-8 h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('notes.noNotes')}</p>
                    </div>
                  ) : (
                    notes.map(note => {
                      // Detect if this is a meeting note (starts with "Meeting Notes" or contains timestamp pattern)
                      const isMeetingNote = note.title.startsWith('Meeting Notes') ||
                        /\d{1,2}\/\d{1,2}\/\d{4}/.test(note.title) ||
                        note.title.includes('Meeting -');

                      return (
                        <div
                          key={note._id}
                          onClick={() => handleSelectNote(note)}
                          className={`p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02] relative ${selectedNote?._id === note._id
                            ? 'bg-gradient-to-r from-[#FFD700]/20 to-[#E6C200]/20 border-2 border-[#FFD700] shadow-lg'
                            : isMeetingNote
                              ? `${isDarkMode
                                ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 hover:from-blue-900/40 hover:to-purple-900/40 border-2 border-blue-700/50'
                                : 'bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-2 border-blue-200'}`
                              : `${isDarkMode ? 'bg-gray-700/30 hover:bg-gray-700/50 border-2 border-gray-600' : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-100'}`
                            }`}
                        >
                          {isMeetingNote && (
                            <div className="absolute top-2 right-2">
                              <Mic className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                            </div>
                          )}
                          <h3 className={`font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'} ${isMeetingNote ? 'pr-8' : ''}`}>
                            {note.title || 'Untitled'}
                          </h3>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </p>
                          {isMeetingNote && (
                            <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold ${isDarkMode
                              ? 'bg-blue-900/50 text-blue-300'
                              : 'bg-blue-100 text-blue-700'
                              }`}>
                              Meeting
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Editor */}
              <div className={`lg:col-span-3 rounded-2xl border p-8 ${isDarkMode
                ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm'
                : 'bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-lg'
                }`}>
                {selectedNote || title || content || isCreatingNew ? (
                  <>
                    {/* Toolbar */}
                    <div className={`flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => {
                            setAiAction('generate');
                            setShowAIModal(true);
                          }}
                          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/30"
                        >
                          <Sparkles size={18} />
                          <span>{t('notes.askAIToWrite')}</span>
                        </button>
                        <button
                          onClick={() => {
                            setAiAction('refine');
                            setShowAIModal(true);
                          }}
                          disabled={!content}
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Wand2 size={18} />
                          <span>{t('notes.refineWithAI')}</span>
                        </button>
                        <button
                          onClick={() => navigate('/notes/meeting')}
                          style={{
                            background: `linear-gradient(135deg, ${preferences.accentColor} 0%, ${preferences.accentColor}dd 100%)`
                          }}
                          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:opacity-90"
                        >
                          <Mic size={18} />
                          <span>{t('notes.newMeetingNote')}</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedNote && (
                          <button
                            onClick={() => setDeleteConfirmId(selectedNote._id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${isDarkMode
                              ? 'text-red-400 hover:bg-red-900/20'
                              : 'text-red-600 hover:bg-red-50'
                              }`}
                          >
                            <Trash2 size={18} />
                            {t('common.delete')}
                          </button>
                        )}
                        <button
                          onClick={selectedNote ? handleSaveNote : handleCreateNote}
                          className="flex items-center gap-2 bg-gradient-to-r from-[#FFD700] to-[#E6C200] hover:from-[#E6C200] hover:to-[#FFD700] text-gray-900 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-yellow-500/30"
                        >
                          <Save size={18} />
                          {selectedNote ? t('common.save') : t('common.create')}
                        </button>
                      </div>
                    </div>

                    {/* Title Input */}
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t('notes.noteTitlePlaceholder')}
                      className={`w-full text-3xl font-bold bg-transparent border-none outline-none mb-6 placeholder-gray-400 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    />

                    {/* Content Textarea */}
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={t('notes.noteContentPlaceholder')}
                      className={`w-full h-[calc(100vh-500px)] bg-transparent border-none outline-none resize-none placeholder-gray-400 leading-relaxed text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    />
                  </>
                ) : (
                  /* Empty State */
                  <div className="flex flex-col items-center justify-center h-[calc(100vh-400px)]">
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 ${isDarkMode ? 'bg-gradient-to-br from-gray-700 to-gray-600' : 'bg-gradient-to-br from-gray-100 to-gray-200'
                      }`}>
                      <FileText className={`w-16 h-16 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    </div>
                    <h3 className={`text-3xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {t('notes.noNoteSelected')}
                    </h3>
                    <p className={`text-center mb-8 max-w-md text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('notes.selectNotePrompt')}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedNote(null);
                        setTitle('');
                        setContent('');
                        setIsCreatingNew(true);
                      }}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#FFD700] to-[#E6C200] hover:from-[#E6C200] hover:to-[#FFD700] text-gray-900 px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-yellow-500/30 hover:scale-105"
                    >
                      <Plus size={24} />
                      {t('notes.createNewNote')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* AI Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-2xl w-full p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-2xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {aiAction === 'generate' ? t('notes.generateNoteWithAI') : 'Refine Note with AI'}
            </h2>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {aiAction === 'generate'
                ? t('notes.aiPromptPlaceholder')
                : 'Tell the AI how you want to improve your note (e.g., "make it more concise", "add more details", "fix grammar").'}
            </p>

            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey && !isGenerating && aiPrompt.trim()) {
                  handleAIGenerate();
                }
              }}
              placeholder={
                aiAction === 'generate'
                  ? t('notes.aiPromptExample')
                  : 'e.g., "Make it more concise and professional"'
              }
              className={`w-full h-32 px-4 py-3 border-2 rounded-xl focus:border-[#FFD700] focus:outline-none resize-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-200 text-gray-900'}`}
            />

            <p className="text-xs text-gray-500 mt-2">
              Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> to submit
            </p>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleAIGenerate}
                disabled={isGenerating || !aiPrompt.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    {aiAction === 'generate' ? t('notes.generate') : 'Refine'}
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowAIModal(false);
                  setAiPrompt('');
                }}
                disabled={isGenerating}
                className={`px-6 py-3 border-2 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Delete Note?
              </h2>
            </div>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to delete this note? This action cannot be undone.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDeleteNote(deleteConfirmId)}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
              >
                <Trash2 size={20} />
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className={`flex-1 px-6 py-3 border-2 rounded-xl font-bold transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dock Navigation */}
      <DockNavigation />
    </div>
  );
};

export default NotesPage;
