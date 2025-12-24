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
