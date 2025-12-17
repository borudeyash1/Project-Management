import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, FileText, Wand2, Save, Trash2, Plus } from 'lucide-react';
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

interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotesPage: React.FC = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const { dispatch } = useApp();
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
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#E6C200] rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-900" />
              </div>
              <div>
                <h1 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('notes.title')}</h1>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('notes.subtitle')}</p>
              </div>
            </div>
          </div>

          {/* Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Notes List Sidebar */}
            <div className={`lg:col-span-1 rounded-xl shadow-sm border p-4 max-h-[calc(100vh-250px)] overflow-y-auto ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <button
                onClick={() => {
                  setSelectedNote(null);
                  setTitle('');
                  setContent('');
                  setIsCreatingNew(true);
                }}
                className="w-full flex items-center gap-2 bg-[#FFD700] hover:bg-[#E6C200] text-gray-900 px-4 py-3 rounded-lg font-bold transition-colors mb-4"
              >
                <Plus size={20} />
                {t('notes.newNote')}
              </button>

              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">{t('common.loading')}</p>
                  </div>
                ) : notes.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">{t('notes.noNotes')}</p>
                ) : (
                  notes.map(note => (
                    <div
                      key={note._id}
                      onClick={() => handleSelectNote(note)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedNote?._id === note._id
                        ? 'bg-[#FFD700]/20 border-2 border-[#FFD700]'
                        : `${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} border-2 border-transparent`
                        }`}
                    >
                      <h3 className={`font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{note.title || 'Untitled'}</h3>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Editor */}
            <div className={`lg:col-span-3 rounded-xl shadow-sm border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              {selectedNote || title || content || isCreatingNew ? (
                <>
                  {/* Toolbar */}
                  <div className={`flex items-center justify-between mb-6 pb-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setAiAction('generate');
                          setShowAIModal(true);
                        }}
                        style={{
                          background: 'linear-gradient(to right, #9333ea, #7e22ce)',
                          color: 'white'
                        }}
                        className="flex items-center gap-2 hover:opacity-90 px-4 py-2 rounded-lg font-semibold transition-all shadow-md"
                      >
                        <Sparkles size={18} />
                        <span>Ask AI to Write</span>
                      </button>
                      <button
                        onClick={() => {
                          setAiAction('refine');
                          setShowAIModal(true);
                        }}
                        disabled={!content}
                        style={{
                          background: content ? 'linear-gradient(to right, #2563eb, #1d4ed8)' : '#9ca3af',
                          color: 'white'
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Wand2 size={18} />
                        <span>Refine with AI</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedNote && (
                        <button
                          onClick={() => setDeleteConfirmId(selectedNote._id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}
                        >
                          <Trash2 size={18} />
                          {t('common.delete')}
                        </button>
                      )}
                      <button
                        onClick={selectedNote ? handleSaveNote : handleCreateNote}
                        className="flex items-center gap-2 bg-[#FFD700] hover:bg-[#E6C200] text-gray-900 px-4 py-2 rounded-lg font-semibold transition-colors"
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
                    className={`w-full text-3xl font-bold bg-transparent border-none outline-none mb-4 placeholder-gray-400 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  />

                  {/* Content Textarea */}
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={t('notes.noteContentPlaceholder')}
                    className={`w-full h-[calc(100vh-450px)] bg-transparent border-none outline-none resize-none placeholder-gray-400 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  />
                </>
              ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center h-[calc(100vh-350px)]">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <FileText className={`w-12 h-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    No Note Selected
                  </h3>
                  <p className={`text-center mb-6 max-w-md ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Select an existing note from the sidebar or create a new one to get started
                  </p>
                  <button
                    onClick={() => {
                      setSelectedNote(null);
                      setTitle('');
                      setContent('');
                      setIsCreatingNew(true);
                    }}
                    className="flex items-center gap-2 bg-[#FFD700] hover:bg-[#E6C200] text-gray-900 px-6 py-3 rounded-lg font-bold transition-colors"
                  >
                    <Plus size={20} />
                    Create New Note
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* AI Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-2xl w-full p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-2xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {aiAction === 'generate' ? 'Generate Note with AI' : 'Refine Note with AI'}
            </h2>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {aiAction === 'generate'
                ? 'Tell the AI what you want to write about, and it will generate a detailed note for you.'
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
                  ? 'e.g., "Write a comprehensive guide on project management best practices"'
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
                    {aiAction === 'generate' ? 'Generate' : 'Refine'}
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
