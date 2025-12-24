import { InvokeChannels } from './channels/invoke';
import { OnChannels } from './channels/on';
import { TreeChannels } from './channels/tree';

export const allowedInvokeChannels = Object.freeze([
  InvokeChannels.createProfile,
  InvokeChannels.deleteProfile,
  InvokeChannels.renameProfile,
  InvokeChannels.login,
  InvokeChannels.logout,
  InvokeChannels.updateUISettings,
  InvokeChannels.updateTabGroups,
  InvokeChannels.getNote,
  InvokeChannels.updateNoteContent,
  InvokeChannels.renameNote,
  // Channels for communication for the TreeView component:
  TreeChannels.createNode,
  TreeChannels.createNodeAbove,
  TreeChannels.createNodeBelow,
  TreeChannels.getState,
  TreeChannels.toggleDirOpen,
  TreeChannels.renameNode,
  TreeChannels.handleSelection,
  TreeChannels.deleteNode,
  TreeChannels.deleteSelectedNodes,
  TreeChannels.search,
  TreeChannels.collapseAll,
  TreeChannels.clearSelection,
  TreeChannels.selectAll,
  TreeChannels.moveSelectedFilesAbove,
  TreeChannels.moveSelectedFilesBelow,
  TreeChannels.moveSelectedFoldersAbove,
  TreeChannels.moveSelectedFoldersBelow,
  TreeChannels.moveSelectedNodesInto,
] as const);
export const allowedOnChannels = Object.freeze([OnChannels.startup] as const);

export interface ElectronAPI {
  invoke: <T = void>(channel: (typeof allowedInvokeChannels)[number], ...data: any[]) => Promise<T>;
  on: (channel: (typeof allowedOnChannels)[number], func: (...args: any[]) => void) => void;
  resolveFilePath: (file: File) => string;
}
