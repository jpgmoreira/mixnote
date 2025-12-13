import { InvokeChannels } from './channels/invoke';
import { OnChannels } from './channels/on';

export const allowedInvokeChannels = Object.freeze([
  InvokeChannels.createProfile,
  InvokeChannels.deleteProfile,
  InvokeChannels.renameProfile,
  InvokeChannels.login,
  InvokeChannels.logout,
] as const);
export const allowedOnChannels = Object.freeze([OnChannels.startup] as const);

export interface ElectronAPI {
  invoke: <T = void>(channel: (typeof allowedInvokeChannels)[number], ...data: any[]) => Promise<T>;
  on: (channel: (typeof allowedOnChannels)[number], func: (...args: any[]) => void) => void;
  resolveFilePath: (file: File) => string;
}
