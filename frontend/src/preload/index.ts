// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

// Expose ipcRenderer to the renderer process via the `window.electron` object
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
    receive: (channel: string, callback: (...args: any[]) => void) => ipcRenderer.on(channel, callback)
  }
});
