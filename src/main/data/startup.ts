import { StartupDTO } from '@common/dto/startupDTO';
import { ProfileManager } from './managers/profileManager';
import { TreeManager } from './managers/treeManager';

export async function loadStartupData() {
  const profile = ProfileManager.instance.getCurrProfile();
  const registry = ProfileManager.instance.getProfileRegistry();
  const data: StartupDTO = {
    profile,
    registry,
  };
  if (profile) {
    TreeManager.instance.loadTree(profile.id);
  }
  return data;
}
