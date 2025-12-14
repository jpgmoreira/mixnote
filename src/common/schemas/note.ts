import { buildId } from '@common/utils/utils';

export type Note = {
  id: string;
  title: string;
  createdAt: number;
  lastModified: number;
  head: string;
  body: string;
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
