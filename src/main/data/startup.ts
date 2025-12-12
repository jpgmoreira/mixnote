import { StartupDTO } from '@common/dto/startupDTO';
import { ProfileManager } from './managers/profileManager';

export async function loadStartupData() {
  const profile = ProfileManager.instance.getCurrProfile();
  const registry = ProfileManager.instance.getProfileRegistry();
  const data: StartupDTO = {
    profile,
    registry,
  };
  return data;
}
