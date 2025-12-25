import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';

export interface StickyNoteData {
    _id: string;
    title: string;
    content: string;
    color: string;
    position: { x: number; y: number };
    isSticky: boolean;
    isTemp?: boolean;
}

interface StickyNotesContextType {
    activeStickyNotes: StickyNoteData[];
    addNote: () => void;
    closeNote: (id: string) => void;
    updateNote: (savedNote: any) => void;
    refreshNotes: () => Promise<void>;
}

const StickyNotesContext = createContext<StickyNotesContextType | undefined>(undefined);

export const StickyNotesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeStickyNotes, setActiveStickyNotes] = useState<StickyNoteData[]>([]);

    const fetchStickyNotes = async () => {
        try {
            const res = await apiService.get('/notes');
            if ((res as any).data) {
                // Filter for sticky notes that are not archived/deleted
                const savedNotes = (res as any).data.filter((n: any) => n.isSticky && !n.isArchived && !n.isDeleted);
                setActiveStickyNotes(savedNotes);
            }
        } catch (e) {
            console.error('Failed to load sticky notes', e);
        }
    };

    useEffect(() => {
        fetchStickyNotes();
    }, []);

    const addNote = () => {
        const tempId = `temp-${Date.now()}`;
        const newNote: StickyNoteData = {
            _id: tempId,
            isTemp: true,
            isSticky: true,
            title: '',
            content: '',
            color: '#fff9c4', // Default yellow
            position: { x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 100 }
        };
        setActiveStickyNotes(prev => [...prev, newNote]);
    };

    const closeNote = (id: string) => {
        setActiveStickyNotes(prev => prev.filter(note => note._id !== id));
    };

    const updateNote = (savedNote: any) => {
        setActiveStickyNotes(prev => prev.map(n => {
            // If passing a real note back (has _id)
            if (n._id === savedNote._id) {
                return { ...n, ...savedNote, isTemp: false };
            }
            return n;
        }));
    };

    const refreshNotes = async () => {
        await fetchStickyNotes();
    };

    return (
        <StickyNotesContext.Provider value={{ activeStickyNotes, addNote, closeNote, updateNote, refreshNotes }}>
            {children}
        </StickyNotesContext.Provider>
    );
};

export const useStickyNotes = () => {
    const context = useContext(StickyNotesContext);
    if (context === undefined) {
        throw new Error('useStickyNotes must be used within a StickyNotesProvider');
    }
    return context;
};
