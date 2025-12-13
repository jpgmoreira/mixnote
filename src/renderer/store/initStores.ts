import { useProfileStore } from './profile';
import { useUIStore } from './ui';

export function initStores() {
  useProfileStore();
  useUIStore();
}
