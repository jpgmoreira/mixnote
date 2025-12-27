import { useProfileStore } from './profile';
import { useUIStore } from './ui';
import { useNotesStore } from './notes';
import { useConfigStore } from './config';
import { useGraphStore } from './graph';

export function initStores() {
  useProfileStore();
  useUIStore();
  useNotesStore();
  useConfigStore();
  useGraphStore();
}
