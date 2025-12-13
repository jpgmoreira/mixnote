import { ProfileManager } from '@main/data/managers/profileManager';
import { loadStartupData } from '@main/data/startup';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { InvokeChannels } from '@preload/channels/invoke';
import { AuthResponseDTO } from '@common/dto/authResponseDTO';
import { GenericResponseDTO } from '@common/dto/genericResponseDTO';
import { StartupDTO } from '@common/dto/startupDTO';

ipcMain.handle(
  InvokeChannels.createProfile,
  async (_: IpcMainInvokeEvent, name: string): Promise<AuthResponseDTO> => {
    const result = ProfileManager.instance.createProfile(name);
    if (result.status === 'error') {
      return result;
    }
    const data = await loadStartupData();
    return {
      status: 'success',
      data,
    };
  }
);

ipcMain.handle(
  InvokeChannels.renameProfile,
  async (_: IpcMainInvokeEvent, profileId: string, name: string): Promise<GenericResponseDTO> =>
    ProfileManager.instance.renameProfile(profileId, name)
);

ipcMain.handle(
  InvokeChannels.deleteProfile,
  async (_: IpcMainInvokeEvent, profileId: string): Promise<GenericResponseDTO> =>
    ProfileManager.instance.deleteProfile(profileId)
);

ipcMain.handle(
  InvokeChannels.login,
  async (_: IpcMainInvokeEvent, profileId: string): Promise<StartupDTO> => {
    ProfileManager.instance.login(profileId);
    return loadStartupData();
  }
);

// ipcMain.handle(InvokeChannels.logout, async (_: IpcMainInvokeEvent): Promise<RendererResponseDTO> => {
//   ProfileManager.instance.logout();
//   return loadStartupData();
// });
