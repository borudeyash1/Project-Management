import { Response } from 'express';
import Note from '../models/Note';
import { AuthenticatedRequest } from '../types';

export const getNotes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const notes = await Note.find({ user: req.user._id }).sort({ updatedAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notes', error });
    }
};

export const createNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { title, content, tags, isSticky, color, position } = req.body;

        const newNote = new Note({
            user: req.user._id,
            title,
            content,
            tags,
            isSticky,
            color,
            position
        });

        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    } catch (error) {
        res.status(500).json({ message: 'Error creating note', error });
    }
};

export const updateNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { id } = req.params;
        const { title, content, tags, isSticky, color, position } = req.body;

        const updatedNote = await Note.findOneAndUpdate(
            { _id: id, user: req.user._id },
            {
                title,
                content,
                tags,
                isSticky,
                color,
                position,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!updatedNote) {
            res.status(404).json({ message: 'Note not found' });
            return;
        }

        res.json(updatedNote);
    } catch (error) {
        res.status(500).json({ message: 'Error updating note', error });
    }
};

export const deleteNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { id } = req.params;
        const deletedNote = await Note.findOneAndDelete({ _id: id, user: req.user._id });

        if (!deletedNote) {
            res.status(404).json({ message: 'Note not found' });
            return;
        }

        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting note', error });
    }
};
