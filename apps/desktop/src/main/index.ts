import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { join } from "node:path";

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
} from "../shared/project";
import { ProjectSession } from "./project-session";

const projectSession = new ProjectSession();

function registerProjectHandlers(): void {
  ipcMain.handle(PROJECT_SNAPSHOT_CHANNEL, () => projectSession.getSnapshot());
  ipcMain.handle(PROJECT_SELECT_CHANNEL, async (event) => {
    const ownerWindow = BrowserWindow.fromWebContents(event.sender);
    const options: Electron.OpenDialogOptions = {
      properties: ["openDirectory"],
      title: "Open a project",
    };
    const result = ownerWindow
      ? await dialog.showOpenDialog(ownerWindow, options)
      : await dialog.showOpenDialog(options);

    if (result.canceled || result.filePaths.length === 0) {
      return { status: "cancelled" } as const;
    }

    return {
      status: "selected" as const,
      snapshot: await projectSession.select(result.filePaths[0]),
    };
  });
  ipcMain.handle(PROJECT_INITIALIZE_CHANNEL, () => projectSession.initialize());
  ipcMain.handle(MEMORY_ITEMS_CHANNEL, (_event, layer, query) => projectSession.listMemoryItems(layer, query));
  ipcMain.handle(MEMORY_CREATE_WORKING_SET_CHANNEL, (_event, content) =>
    projectSession.createWorkingSetItem(content),
  );
  ipcMain.handle(MEMORY_PROMOTE_WORKING_SET_CHANNEL, (_event, itemId) =>
    projectSession.promoteWorkingSetItem(itemId),
  );
  ipcMain.handle(MEMORY_UPDATE_ITEM_CONTENT_CHANNEL, (_event, itemId, content) =>
    projectSession.updateKnowledgeItemContent(itemId, content),
  );
  ipcMain.handle(MEMORY_DELETE_ITEM_CHANNEL, (_event, itemId) =>
    projectSession.deleteKnowledgeItem(itemId),
  );
  ipcMain.handle(MEMORY_EXPIRE_ITEM_CHANNEL, (_event, itemId) =>
    projectSession.expireKnowledgeItem(itemId),
  );
}

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    show: false,
    backgroundColor: "#071013",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.once("ready-to-show", () => window.show());

  if (process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void window.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  registerProjectHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => projectSession.close());
