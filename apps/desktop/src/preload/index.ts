import { contextBridge, ipcRenderer } from "electron";

import {
  MEMORY_CREATE_WORKING_SET_CHANNEL,
  MEMORY_DELETE_ITEM_CHANNEL,
  MEMORY_EXPIRE_ITEM_CHANNEL,
  MEMORY_ITEMS_CHANNEL,
  MEMORY_PROMOTE_WORKING_SET_CHANNEL,
  MEMORY_UPDATE_ITEM_CONTENT_CHANNEL,
  PROJECT_INITIALIZE_CHANNEL,
  PROJECT_SELECT_CHANNEL,
  PROJECT_SNAPSHOT_CHANNEL,
  type CreateWorkingSetItemResult,
  type DeleteKnowledgeItemResult,
  type ExpireKnowledgeItemResult,
  type HarnessDesktopApi,
  type MemoryItemSnapshot,
  type MemoryLayerId,
  type PromoteWorkingSetItemResult,
  type ProjectInitializationResult,
  type ProjectSelectionResult,
  type ProjectSnapshot,
  type UpdateKnowledgeItemContentResult,
} from "../shared/project";

const desktopApi: HarnessDesktopApi = {
  getProjectSnapshot: () =>
    ipcRenderer.invoke(PROJECT_SNAPSHOT_CHANNEL) as Promise<ProjectSnapshot>,
  selectProject: () =>
    ipcRenderer.invoke(PROJECT_SELECT_CHANNEL) as Promise<ProjectSelectionResult>,
  initializeProject: () =>
    ipcRenderer.invoke(PROJECT_INITIALIZE_CHANNEL) as Promise<ProjectInitializationResult>,
  listMemoryItems: (layer?: MemoryLayerId, query?: string) =>
    ipcRenderer.invoke(MEMORY_ITEMS_CHANNEL, layer, query) as Promise<MemoryItemSnapshot[]>,
  createWorkingSetItem: (content: string) =>
    ipcRenderer.invoke(
      MEMORY_CREATE_WORKING_SET_CHANNEL,
      content,
    ) as Promise<CreateWorkingSetItemResult>,
  promoteWorkingSetItem: (itemId: string) =>
    ipcRenderer.invoke(
      MEMORY_PROMOTE_WORKING_SET_CHANNEL,
      itemId,
    ) as Promise<PromoteWorkingSetItemResult>,
  updateKnowledgeItemContent: (itemId: string, content: string) =>
    ipcRenderer.invoke(
      MEMORY_UPDATE_ITEM_CONTENT_CHANNEL,
      itemId,
      content,
    ) as Promise<UpdateKnowledgeItemContentResult>,
  deleteKnowledgeItem: (itemId: string) =>
    ipcRenderer.invoke(MEMORY_DELETE_ITEM_CHANNEL, itemId) as Promise<DeleteKnowledgeItemResult>,
  expireKnowledgeItem: (itemId: string) =>
    ipcRenderer.invoke(MEMORY_EXPIRE_ITEM_CHANNEL, itemId) as Promise<ExpireKnowledgeItemResult>,
};

contextBridge.exposeInMainWorld("harness", desktopApi);
