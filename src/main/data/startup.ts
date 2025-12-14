import { StartupDTO } from '@common/dto/startupDTO';
import { ProfileManager } from './managers/profileManager';
import { TreeManager } from './managers/treeManager';
import { UIManager } from './managers/uiManager';

export async function loadStartupData() {
  const profile = ProfileManager.instance.getCurrProfile();
  const registry = ProfileManager.instance.getProfileRegistry();
  const data: StartupDTO = {
    profile,
    registry,
    ui: null,
  };
  if (profile) {
    TreeManager.instance.loadTree(profile.id);
    UIManager.instance.loadProfile(profile.id);
    data.ui = UIManager.instance.getUISettings();
  }
  return data;
}
