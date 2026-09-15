import { contextBridge, ipcRenderer } from "electron";

import {
  PROJECT_SNAPSHOT_CHANNEL,
  type HarnessDesktopApi,
  type ProjectSnapshot,
} from "../shared/project";

const desktopApi: HarnessDesktopApi = {
  getProjectSnapshot: () =>
    ipcRenderer.invoke(PROJECT_SNAPSHOT_CHANNEL) as Promise<ProjectSnapshot>,
};

contextBridge.exposeInMainWorld("harness", desktopApi);
