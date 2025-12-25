import React from 'react';
import { useStickyNotes } from '../context/StickyNotesContext';
import StickyNote from './StickyNote';

const StickyNotesContainer: React.FC = () => {
    const { activeStickyNotes, closeNote, updateNote } = useStickyNotes();

    if (activeStickyNotes.length === 0) return null;

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, zIndex: 9999 }}>
            {activeStickyNotes.map(note => (
                <StickyNote
                    key={note._id}
                    id={note.isTemp ? undefined : note._id}
                    initialTitle={note.title}
                    initialContent={note.content}
                    initialColor={note.color}
                    initialPosition={note.position}
                    onClose={() => closeNote(note._id)}
                    onSave={updateNote}
                />
            ))}
        </div>
    );
};

export default StickyNotesContainer;
