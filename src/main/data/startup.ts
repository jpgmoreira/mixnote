import { StartupDTO } from '@common/dto/startupDTO';
import { ProfileManager } from './managers/profileManager';
import { TreeManager } from './managers/treeManager';
import { UIManager } from './managers/uiManager';
import { NotesManager } from './managers/notesManager';
import { TabsManager } from './managers/tabsManager';
import { SettingsManager } from './managers/settingsManager';

export async function loadStartupData() {
  const profile = ProfileManager.instance.getCurrProfile();
  const registry = ProfileManager.instance.getProfileRegistry();
  const data: StartupDTO = {
    profile,
    registry,
    ui: null,
    tabGroups: null,
    settings: null,
  };
  if (profile) {
    TreeManager.instance.loadTree(profile.id);
    UIManager.instance.loadProfile(profile.id);
    NotesManager.instance.loadProfile(profile.id);
    TabsManager.instance.loadProfile(profile.id);
    SettingsManager.instance.loadProfile(profile.id);
    data.ui = UIManager.instance.getUISettings();
    data.tabGroups = TabsManager.instance.getGroups();
    data.settings = SettingsManager.instance.getSettings();
  }
  return data;
}
