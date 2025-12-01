import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, Wand2, Save, Trash2, Plus } from 'lucide-react';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import ContentBanner from './ContentBanner';
import Header from './Header';
import DockNavigation from './DockNavigation';
import { apiService } from '../services/api';

interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiAction, setAiAction] = useState<'generate' | 'refine'>('generate');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const data = await apiService.get('/notes') as unknown as Note[];
      setNotes(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setIsLoading(false);
    }
  };

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
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Error creating note:', error);
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
    } catch (error) {
      console.error('Error saving note:', error);
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
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
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
    <div className="min-h-screen flex flex-col bg-gray-50">
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
                <h1 className="text-3xl font-black text-gray-900">AI Notes</h1>
                <p className="text-gray-600">Create, edit, and refine notes with AI assistance</p>
              </div>
            </div>
          </div>

          {/* Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Notes List Sidebar */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 max-h-[calc(100vh-250px)] overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedNote(null);
                  setTitle('');
                  setContent('');
                }}
                className="w-full flex items-center gap-2 bg-[#FFD700] hover:bg-[#E6C200] text-gray-900 px-4 py-3 rounded-lg font-bold transition-colors mb-4"
              >
                <Plus size={20} />
                New Note
              </button>

              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Loading notes...</p>
                  </div>
                ) : notes.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">No notes yet</p>
                ) : (
                  notes.map(note => (
                    <div
                      key={note._id}
                      onClick={() => handleSelectNote(note)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedNote?._id === note._id
                          ? 'bg-[#FFD700]/20 border-2 border-[#FFD700]'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <h3 className="font-bold text-gray-900 truncate">{note.title || 'Untitled'}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Editor */}
            <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setAiAction('generate');
                      setShowAIModal(true);
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                  >
                    <Sparkles size={18} />
                    Ask AI to Write
                  </button>
                  <button
                    onClick={() => {
                      setAiAction('refine');
                      setShowAIModal(true);
                    }}
                    disabled={!content}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Wand2 size={18} />
                    Refine with AI
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {selectedNote && (
                    <button
                      onClick={() => handleDeleteNote(selectedNote._id)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  )}
                  <button
                    onClick={selectedNote ? handleSaveNote : handleCreateNote}
                    className="flex items-center gap-2 bg-[#FFD700] hover:bg-[#E6C200] text-gray-900 px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    <Save size={18} />
                    {selectedNote ? 'Save' : 'Create'}
                  </button>
                </div>
              </div>

              {/* Title Input */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title..."
                className="w-full text-3xl font-bold text-gray-900 bg-transparent border-none outline-none mb-4 placeholder-gray-400"
              />

              {/* Content Textarea */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing or use AI to generate content..."
                className="w-full h-[calc(100vh-450px)] text-gray-700 bg-transparent border-none outline-none resize-none placeholder-gray-400 leading-relaxed"
              />
            </div>
          </div>
        </div>
      </main>

      {/* AI Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              {aiAction === 'generate' ? 'Generate Note with AI' : 'Refine Note with AI'}
            </h2>
            <p className="text-gray-600 mb-6">
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
              className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FFD700] focus:outline-none resize-none"
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
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
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
