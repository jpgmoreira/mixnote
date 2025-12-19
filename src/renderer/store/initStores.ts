import { useProfileStore } from './profile';
import { useUIStore } from './ui';
import { useNotesStore } from './notes';

export function initStores() {
  useProfileStore();
  useUIStore();
  useNotesStore();
}
