import type { HarnessDesktopApi } from "../../shared/project";

declare global {
  interface Window {
    harness: HarnessDesktopApi;
  }
}

export {};
