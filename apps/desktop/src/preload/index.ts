import { contextBridge, ipcRenderer } from "electron";

import {
  MEMORY_CREATE_WORKING_SET_CHANNEL,
  MEMORY_ITEMS_CHANNEL,
  PROJECT_INITIALIZE_CHANNEL,
  PROJECT_SELECT_CHANNEL,
  PROJECT_SNAPSHOT_CHANNEL,
  type CreateWorkingSetItemResult,
  type HarnessDesktopApi,
  type MemoryItemSnapshot,
  type MemoryLayerId,
  type ProjectInitializationResult,
  type ProjectSelectionResult,
  type ProjectSnapshot,
} from "../shared/project";

const desktopApi: HarnessDesktopApi = {
  getProjectSnapshot: () =>
    ipcRenderer.invoke(PROJECT_SNAPSHOT_CHANNEL) as Promise<ProjectSnapshot>,
  selectProject: () =>
    ipcRenderer.invoke(PROJECT_SELECT_CHANNEL) as Promise<ProjectSelectionResult>,
  initializeProject: () =>
    ipcRenderer.invoke(PROJECT_INITIALIZE_CHANNEL) as Promise<ProjectInitializationResult>,
  listMemoryItems: (layer?: MemoryLayerId) =>
    ipcRenderer.invoke(MEMORY_ITEMS_CHANNEL, layer) as Promise<MemoryItemSnapshot[]>,
  createWorkingSetItem: (content: string) =>
    ipcRenderer.invoke(
      MEMORY_CREATE_WORKING_SET_CHANNEL,
      content,
    ) as Promise<CreateWorkingSetItemResult>,
};

contextBridge.exposeInMainWorld("harness", desktopApi);
