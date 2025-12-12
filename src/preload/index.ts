// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer, webUtils } from 'electron';
import { allowedInvokeChannels, allowedOnChannels, type ElectronAPI } from './api';

type InvokeChannel = (typeof allowedInvokeChannels)[number];
type OnChannel = (typeof allowedOnChannels)[number];

// https://stackoverflow.com/questions/57807459/how-to-use-preload-js-properly-in-electron
contextBridge.exposeInMainWorld(
  'api',
  Object.freeze({
    invoke: (channel: InvokeChannel, ...data: unknown[]) => {
      if (!allowedInvokeChannels.includes(channel)) {
        throw new Error(`[api.invoke] Channel "${channel}" is not allowed.`);
      }
      return ipcRenderer.invoke(channel, ...data);
    },
    on: (channel: OnChannel, func: (...data: unknown[]) => void) => {
      if (!allowedOnChannels.includes(channel)) {
        throw new Error(`[api.on] Channel "${channel}" is not allowed.`);
      }
      ipcRenderer.on(channel, (_, ...args) => func(...args));
    },
    // This workaround below is necessary because in recent versions of Electron, they dropped
    // the "path" property for files in user events in the renderer.
    // [https://github.com/electron/electron/issues/43302#issuecomment-2286132938]
    resolveFilePath(file: File) {
      return webUtils.getPathForFile(file);
    },
  } as ElectronAPI)
);
