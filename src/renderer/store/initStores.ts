import { useProfileStore } from './profile';
import { useUIStore } from './ui';
import { useNotesStore } from './notes';
import { useConfigStore } from './config';

export function initStores() {
  useProfileStore();
  useUIStore();
  useNotesStore();
  useConfigStore();
}
