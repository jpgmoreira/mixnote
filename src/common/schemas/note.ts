import { buildId } from '@common/utils/utils';

export type NoteFrequency = 'high' | 'normal' | 'low';

export type Note = {
  id: string;
  title: string;
  createdAt: number;
  lastModified: number;
  head: string;
  body: string;
  frequency?: NoteFrequency; // Not persisted. Used only on flashcards.
};

export function getEmptyNote(title: string, timestamp: number): Note {
  const noteId = buildId(title, timestamp);
  return {
    id: noteId,
    title,
    createdAt: timestamp,
    lastModified: timestamp,
    head: '',
    body: '',
  };
}

const NOTE_KEYS = ['id', 'title', 'createdAt', 'lastModified', 'head', 'body'];

export function sanitizeNote(note: Note) {
  for (const key of Object.keys(note)) {
    if (!NOTE_KEYS.includes(key)) {
      delete note[key];
    }
  }
}
