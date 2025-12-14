import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { TreeChannels } from '@preload/channels/tree';
import { TreeManager } from '@main/data/managers/treeManager';
import { NodeType } from '@common/types/tree';
import { ModifierKeys } from '@common/types/keys';
import { TreeOperationResponseDTO } from '@common/dto/treeOperationResponseDTO';
import { GenericResponseDTO } from '@common/dto/genericResponseDTO';
import { measure } from '@main/performance/performance';
import { sleep } from '@common/utils/utils';

ipcMain.handle(
  TreeChannels.createNode,
  (
    _: IpcMainInvokeEvent,
    scrollTop: number,
    type: NodeType,
    prefix: string,
    parentId: string | null
  ): TreeOperationResponseDTO => {
    return measure('createNode', () => {
      TreeManager.instance.createNode(type, prefix, parentId);
      return TreeManager.instance.buildResult(scrollTop);
    });
  }
);

ipcMain.handle(
  TreeChannels.createNodeAbove,
  (
    _: IpcMainInvokeEvent,
    scrollTop: number,
    type: NodeType,
    prefix: string,
    baseNodeId: string
  ): TreeOperationResponseDTO => {
    return measure('createNodeAbove', () => {
      TreeManager.instance.createNodeAbove(type, prefix, baseNodeId);
      return TreeManager.instance.buildResult(scrollTop);
    });
  }
);

ipcMain.handle(
  TreeChannels.createNodeBelow,
  (
    _: IpcMainInvokeEvent,
    scrollTop: number,
    type: NodeType,
    prefix: string,
    baseNodeId: string
  ): TreeOperationResponseDTO => {
    return measure('createNodeBelow', () => {
      TreeManager.instance.createNodeBelow(type, prefix, baseNodeId);
      return TreeManager.instance.buildResult(scrollTop);
    });
  }
);

ipcMain.handle(
  TreeChannels.getState,
  (_: IpcMainInvokeEvent, scrollTop: number): TreeOperationResponseDTO => {
    return measure('getState', () => TreeManager.instance.buildResult(scrollTop));
  }
);

ipcMain.handle(
  TreeChannels.toggleDirOpen,
  (_: IpcMainInvokeEvent, scrollTop: number, nodeId: string): TreeOperationResponseDTO => {
    return measure('toggleDirOpen', () => {
      TreeManager.instance.toggleDirOpen(nodeId);
      return TreeManager.instance.buildResult(scrollTop);
    });
  }
);

ipcMain.handle(
  TreeChannels.renameNode,
  (_: IpcMainInvokeEvent, nodeId: string, newName: string): GenericResponseDTO => {
    return measure('renameNode', () => TreeManager.instance.renameNode(nodeId, newName));
  }
);

ipcMain.handle(
  TreeChannels.handleSelection,
  (
    _: IpcMainInvokeEvent,
    scrollTop: number,
    nodeId: string,
    keys: ModifierKeys
  ): TreeOperationResponseDTO => {
    return measure('handleSelection', () => {
      TreeManager.instance.handleSelection(nodeId, keys);
      return TreeManager.instance.buildResult(scrollTop);
    });
  }
);

ipcMain.handle(
  TreeChannels.deleteNode,
  async (
    _: IpcMainInvokeEvent,
    scrollTop: number,
    nodeId: string
  ): Promise<TreeOperationResponseDTO> => {
    await sleep(1000);
    return measure('deleteNode', async () => {
      await TreeManager.instance.deleteNode(nodeId);
      return TreeManager.instance.buildResult(scrollTop);
    });
  }
);

ipcMain.handle(
  TreeChannels.deleteSelectedNodes,
  async (_: IpcMainInvokeEvent, scrollTop: number): Promise<TreeOperationResponseDTO> => {
    await sleep(1000);
    return measure('deleteSelectedNodes', async () => {
      await TreeManager.instance.deleteSelectedNodes();
      return TreeManager.instance.buildResult(scrollTop);
    });
  }
);

ipcMain.handle(
  TreeChannels.search,
  (_: IpcMainInvokeEvent, scrollTop: number, searchText: string): TreeOperationResponseDTO => {
    return measure('search', () => {
      TreeManager.instance.search(searchText);
      return TreeManager.instance.buildResult(scrollTop);
    });
  }
);

ipcMain.handle(
  TreeChannels.collapseAll,
  (_: IpcMainInvokeEvent, scrollTop: number): TreeOperationResponseDTO => {
    return measure('collapseAll', () => {
      TreeManager.instance.collapseAll();
      return TreeManager.instance.buildResult(scrollTop);
    });
  }
);

ipcMain.handle(
  TreeChannels.clearSelection,
  (_: IpcMainInvokeEvent, scrollTop: number): TreeOperationResponseDTO => {
    return measure('clearSelection', () => {
      TreeManager.instance.clearSelection();
      return TreeManager.instance.buildResult(scrollTop);
    });
  }
);

ipcMain.handle(
  TreeChannels.selectAll,
  (_: IpcMainInvokeEvent, scrollTop: number): TreeOperationResponseDTO => {
    return measure('selectAll', () => {
      TreeManager.instance.selectAll();
      return TreeManager.instance.buildResult(scrollTop);
    });
  }
);

ipcMain.handle(
  TreeChannels.moveSelectedFilesAbove,
  (_: IpcMainInvokeEvent, scrollTop: number, baseNodeId: string): TreeOperationResponseDTO => {
    return measure('moveSelectedFilesAbove', () => {
      TreeManager.instance.moveSelectedFilesAbove(baseNodeId);
      return TreeManager.instance.buildResult(scrollTop);
    });
  }
);

ipcMain.handle(
  TreeChannels.moveSelectedFilesBelow,
  (_: IpcMainInvokeEvent, scrollTop: number, baseNodeId: string): TreeOperationResponseDTO => {
    return measure('moveSelectedFilesBelow', () => {
      TreeManager.instance.moveSelectedFilesBelow(baseNodeId);
      return TreeManager.instance.buildResult(scrollTop);
    });
  }
);

ipcMain.handle(
  TreeChannels.moveSelectedFoldersAbove,
  (_: IpcMainInvokeEvent, scrollTop: number, baseNodeId: string): TreeOperationResponseDTO => {
    return measure('moveSelectedFoldersAbove', () => {
      TreeManager.instance.moveSelectedFoldersAbove(baseNodeId);
      return TreeManager.instance.buildResult(scrollTop);
    });
  }
);

ipcMain.handle(
  TreeChannels.moveSelectedFoldersBelow,
  (_: IpcMainInvokeEvent, scrollTop: number, nodeId: string): TreeOperationResponseDTO => {
    return measure('moveSelectedFoldersBelow', () => {
      TreeManager.instance.moveSelectedFoldersBelow(nodeId);
      return TreeManager.instance.buildResult(scrollTop);
    });
  }
);

ipcMain.handle(
  TreeChannels.moveSelectedNodesInto,
  (
    _: IpcMainInvokeEvent,
    scrollTop: number,
    destinationId: string | null
  ): TreeOperationResponseDTO => {
    return measure('moveSelectedNodesInto', () => {
      TreeManager.instance.moveSelectedNodesInto(destinationId);
      return TreeManager.instance.buildResult(scrollTop);
    });
  }
);
